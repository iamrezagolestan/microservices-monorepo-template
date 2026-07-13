// Command admin-gen scaffolds the Lowdefy admin pages (ADR-0012) from the service
// OpenAPI specs (ADR-0008). It emits apps/admin/_generated/<service>/ — one page
// file per resource and per action — plus a pages.yaml manifest the root
// lowdefy.yaml references. Output is REST-connector pages only: every mutation goes
// through the service Go API, never raw SQL (the ADR-0012 write-path invariant).
//
// The surface a service gets is driven by two markers on its spec:
//   - a tag with `x-admin: crud`  → a CRUD page for that resource group, built from
//     the operations present: a list table, and (only when they exist) a create form
//     (POST returning 201 — an async 202 workflow create is intentionally skipped),
//     an edit form (PUT), and a delete control (DELETE).
//   - an operation with `x-admin: action` → a single button/form action page.
//
// Pages call the service in-cluster (connectionId == service name) using the raw
// spec paths, so the emitted output is independent of the /api edge prefix.
package main

import (
	"bytes"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"

	"gopkg.in/yaml.v3"
)

const (
	specGlob = "services/*/openapi.yaml"
	outRoot  = "apps/admin/_generated"
	adminDir = "apps/admin"

	pageType   = "PageHeaderMenu"
	typeAxios  = "AxiosHttp"
	typeText   = "TextInput"
	typeNum    = "NumberInput"
	typeSwitch = "Switch"
	typeButton = "Button"
	typeTitle  = "Title"
	typeGrid   = "AgGridAlpine"

	mediaJSON = "application/json"

	mGet    = "get"
	mPost   = "post"
	mPut    = "put"
	mDelete = "delete"

	stateKey   = "_state"
	payloadKey = "_payload"
	requestKey = "_request"
	concatKey  = "_string_concat"

	crudMarker   = "crud"
	actionMarker = "action"
)

var httpMethods = map[string]bool{
	mGet: true, mPut: true, mPost: true, mDelete: true,
	"patch": true, "options": true, "head": true, "trace": true,
}

func main() {
	err := run()
	if err != nil {
		_, _ = fmt.Fprintln(os.Stderr, "admin-gen: "+err.Error())
		os.Exit(1)
	}
}

func run() error {
	specs, err := filepath.Glob(specGlob)
	if err != nil {
		return fmt.Errorf("glob %s: %w", specGlob, err)
	}
	sort.Strings(specs)

	err = os.RemoveAll(outRoot)
	if err != nil {
		return fmt.Errorf("clean %s: %w", outRoot, err)
	}

	var generated []string
	for _, specPath := range specs {
		svc := filepath.Base(filepath.Dir(specPath))
		// _template is scaffolding, not a live service — never generated for.
		if svc == "_template" {
			continue
		}
		refs, err := genService(svc, specPath)
		if err != nil {
			return fmt.Errorf("%s: %w", svc, err)
		}
		generated = append(generated, refs...)
	}

	return writeManifest(generated)
}

// genService writes every page for one service and returns their manifest refs
// (root-relative to apps/admin), in deterministic order.
func genService(svc, specPath string) ([]string, error) {
	data, err := os.ReadFile(specPath)
	if err != nil {
		return nil, fmt.Errorf("read %s: %w", specPath, err)
	}
	var d doc
	err = yaml.Unmarshal(data, &d)
	if err != nil {
		return nil, fmt.Errorf("parse %s: %w", specPath, err)
	}

	resources, actions, err := d.collect()
	if err != nil {
		return nil, err
	}

	var refs []string
	for _, name := range sortedKeys(resources) {
		ref, err := d.writeResourcePage(svc, resources[name])
		if err != nil {
			return nil, err
		}
		if ref != "" {
			refs = append(refs, ref)
		}
	}
	sort.Slice(actions, func(i, j int) bool { return actions[i].OperationID < actions[j].OperationID })
	for _, a := range actions {
		ref, err := d.writeActionPage(svc, a)
		if err != nil {
			return nil, err
		}
		refs = append(refs, ref)
	}
	return refs, nil
}

// collect classifies a spec's operations into CRUD resource groups and standalone
// actions, both keyed and ordered deterministically by the caller.
func (d *doc) collect() (map[string]*resource, []op, error) {
	crud := d.crudTags()
	resources := map[string]*resource{}
	var actions []op

	for _, p := range sortedKeys(d.Paths) {
		methods := d.Paths[p]
		for _, m := range sortedKeys(methods) {
			if !httpMethods[m] {
				continue
			}
			var o op
			node := methods[m]
			err := node.Decode(&o)
			if err != nil {
				return nil, nil, fmt.Errorf("parse %s %s: %w", m, p, err)
			}
			o.method, o.path = m, p

			if o.XAdmin == actionMarker {
				actions = append(actions, o)
				continue
			}
			tag := o.crudTag(crud)
			if tag == "" {
				continue
			}
			r := resources[tag]
			if r == nil {
				r = &resource{name: tag}
				resources[tag] = r
			}
			r.classify(o)
		}
	}
	return resources, actions, nil
}

// writeResourcePage emits one CRUD page: a list table plus create/edit/delete
// controls for whichever operations the resource exposes.
func (d *doc) writeResourcePage(svc string, r *resource) (string, error) {
	if r.list == nil && r.create == nil && r.update == nil && r.remove == nil {
		return "", nil
	}
	pg := page{ID: r.name, Type: pageType, Properties: pageProps{Title: title(r.name)}}

	if r.list != nil {
		d.appendTable(&pg, svc, r.list)
	}
	if r.create != nil {
		create := formSpec{reqID: "create", verb: mPost, heading: "Create", prefix: "create_", op: r.create, button: "Create"}
		d.appendForm(&pg, create)
	}
	if r.update != nil {
		edit := formSpec{reqID: "update", verb: mPut, heading: "Edit", prefix: "edit_", op: r.update, button: "Save"}
		d.appendForm(&pg, edit)
	}
	if r.remove != nil {
		del := formSpec{
			reqID: "remove", verb: mDelete, heading: "Delete",
			prefix: "delete_", op: r.remove, button: "Delete", idOnly: true,
		}
		d.appendForm(&pg, del)
	}
	return writePage(svc, r.name, pg)
}

// writeActionPage emits a single action page: inputs for the operation's path
// params and request body, and a button that posts to the endpoint.
func (d *doc) writeActionPage(svc string, o op) (string, error) {
	pg := page{ID: o.OperationID, Type: pageType, Properties: pageProps{Title: humanize(o.OperationID)}}
	run := formSpec{reqID: "run", verb: o.method, op: &o, button: humanize(o.OperationID)}
	d.appendForm(&pg, run)
	return writePage(svc, o.OperationID, pg)
}

func (d *doc) appendTable(pg *page, svc string, list *op) {
	cols := d.props(list.responseSchema())
	defs := make([]any, 0, len(cols))
	for _, c := range cols {
		defs = append(defs, map[string]any{"field": c.Name, "headerName": headerName(c.Name)})
	}
	req := request{ID: "list", Type: typeAxios, ConnectionID: svc}
	req.Properties = map[string]any{"url": list.path, "method": mGet}
	pg.Requests = append(pg.Requests, req)

	table := block{ID: "table", Type: typeGrid}
	table.Properties = map[string]any{"rowData": map[string]any{requestKey: "list"}, "columnDefs": defs}
	pg.Blocks = append(pg.Blocks, table)
}

// formSpec describes one generated form (create/edit/delete/action).
type formSpec struct {
	reqID, verb, heading, prefix, button string
	op                                   *op
	idOnly                               bool // no body fields (delete)
}

func (d *doc) appendForm(pg *page, f formSpec) {
	payload := map[string]any{}
	data := map[string]any{}

	if f.heading != "" {
		head := block{ID: f.prefix + "heading", Type: typeTitle}
		head.Properties = map[string]any{"content": f.heading, "level": 5}
		pg.Blocks = append(pg.Blocks, head)
	}

	// Path params become inputs (the id for edit/delete/action).
	for _, name := range f.op.pathParams() {
		state := f.prefix + name
		pg.Blocks = append(pg.Blocks, input(state, name, "string"))
		payload[name] = map[string]any{stateKey: state}
	}

	// Request-body fields become inputs, unless this is an id-only (delete) form.
	if !f.idOnly {
		for _, p := range d.props(f.op.bodySchema()) {
			state := f.prefix + p.Name
			pg.Blocks = append(pg.Blocks, input(state, p.Name, p.Type))
			payload[p.Name] = map[string]any{stateKey: state}
			data[p.Name] = map[string]any{payloadKey: p.Name}
		}
	}

	props := map[string]any{"url": pathToURL(f.op.path), "method": f.verb}
	if len(data) > 0 {
		props["data"] = data
	}
	req := request{ID: f.reqID, Type: typeAxios, Properties: props}
	if len(payload) > 0 {
		req.Payload = payload
	}
	pg.Requests = append(pg.Requests, req)

	// The SetState runs only if the Request above resolved — a failed request throws
	// and halts the onClick chain — so it doubles as the success signal.
	doneState := f.prefix + "done"
	onClick := []any{
		map[string]any{"id": f.reqID + "Click", "type": "Request", "params": f.reqID},
		map[string]any{"id": f.reqID + "Done", "type": "SetState", "params": map[string]any{doneState: true}},
	}
	submit := block{ID: f.prefix + "submit", Type: typeButton}
	submit.Properties = map[string]any{"title": f.button}
	submit.Events = map[string]any{"onClick": onClick}
	pg.Blocks = append(pg.Blocks, submit)

	// A confirmation hidden until the request resolves: operator feedback and the
	// e2e acceptance signal (ADR-0018).
	success := block{ID: f.prefix + "success", Type: typeTitle}
	success.Properties = map[string]any{
		"content": f.button + " succeeded",
		"level":   5,
		"visible": map[string]any{stateKey: doneState},
	}
	pg.Blocks = append(pg.Blocks, success)
}

func input(state, label, typ string) block {
	b := block{ID: state, Properties: map[string]any{"label": headerName(label)}}
	switch typ {
	case "integer", "number":
		b.Type = typeNum
	case "boolean":
		b.Type = typeSwitch
	default:
		b.Type = typeText
		if label == "password" {
			b.Properties["type"] = "password"
		}
	}
	return b
}

// ── spec model ────────────────────────────────────────────────────────────────

type doc struct {
	Tags       []tagDef                        `yaml:"tags"`
	Paths      map[string]map[string]yaml.Node `yaml:"paths"`
	Components struct {
		Schemas map[string]yaml.Node `yaml:"schemas"`
	} `yaml:"components"`
}

type tagDef struct {
	Name   string `yaml:"name"`
	XAdmin string `yaml:"x-admin"`
}

type param struct {
	Name string `yaml:"name"`
	In   string `yaml:"in"`
}

type mediaSchema struct {
	Schema yaml.Node `yaml:"schema"`
}

type body struct {
	Content map[string]mediaSchema `yaml:"content"`
}

type op struct {
	OperationID string          `yaml:"operationId"`
	XAdmin      string          `yaml:"x-admin"`
	Tags        []string        `yaml:"tags"`
	Parameters  []param         `yaml:"parameters"`
	RequestBody body            `yaml:"requestBody"`
	Responses   map[string]body `yaml:"responses"`

	method string
	path   string
}

func (d *doc) crudTags() map[string]bool {
	out := map[string]bool{}
	for _, t := range d.Tags {
		if t.XAdmin == crudMarker {
			out[t.Name] = true
		}
	}
	return out
}

// crudTag returns the operation's first tag that is a CRUD resource group.
func (o *op) crudTag(crud map[string]bool) string {
	for _, t := range o.Tags {
		if crud[t] {
			return t
		}
	}
	return ""
}

func (o *op) pathParams() []string {
	var out []string
	for _, p := range o.Parameters {
		if p.In == "path" {
			out = append(out, p.Name)
		}
	}
	return out
}

func (o *op) bodySchema() yaml.Node {
	return o.RequestBody.Content[mediaJSON].Schema
}

func (o *op) responseSchema() yaml.Node {
	return o.Responses["200"].Content[mediaJSON].Schema
}

// segments counts the non-empty path segments (e.g. /orders/{id} == 2).
func (o *op) segments() int {
	return len(strings.FieldsFunc(o.path, func(r rune) bool { return r == '/' }))
}

func (o *op) has201() bool {
	_, ok := o.Responses["201"]
	return ok
}

// resource collects the CRUD operations of one resource group.
type resource struct {
	name                         string
	list, create, update, remove *op
}

// classify assigns an operation to its CRUD role by method and path shape. An
// async create (POST returning 202, not 201) is intentionally left unassigned:
// it is a workflow trigger, not a form-scaffoldable create.
func (r *resource) classify(o op) {
	cp := o
	switch {
	case len(o.pathParams()) == 0 && o.method == mGet:
		r.list = &cp
	case len(o.pathParams()) == 0 && o.method == mPost && o.has201():
		r.create = &cp
	case o.segments() == 2 && o.method == mPut:
		r.update = &cp
	case o.segments() == 2 && o.method == mDelete:
		r.remove = &cp
	}
}

type prop struct {
	Name, Type, Format string
}

// props resolves a schema node to its ordered properties, following a $ref into
// components and unwrapping an array to its item schema.
func (d *doc) props(schema yaml.Node) []prop {
	if schema.Kind == 0 {
		return nil
	}
	var s struct {
		Ref        string    `yaml:"$ref"`
		Type       string    `yaml:"type"`
		Items      yaml.Node `yaml:"items"`
		Properties yaml.Node `yaml:"properties"`
	}
	err := schema.Decode(&s)
	if err != nil {
		return nil
	}
	switch {
	case s.Ref != "":
		node, ok := d.Components.Schemas[path.Base(s.Ref)]
		if !ok {
			return nil
		}
		return d.props(node)
	case s.Type == "array":
		return d.props(s.Items)
	}
	return orderedProps(s.Properties)
}

// orderedProps reads a `properties` mapping node in source order.
func orderedProps(node yaml.Node) []prop {
	if node.Kind != yaml.MappingNode {
		return nil
	}
	out := make([]prop, 0, len(node.Content)/2)
	for i := 0; i+1 < len(node.Content); i += 2 {
		var v struct {
			Type   string `yaml:"type"`
			Format string `yaml:"format"`
		}
		_ = node.Content[i+1].Decode(&v)
		out = append(out, prop{Name: node.Content[i].Value, Type: v.Type, Format: v.Format})
	}
	return out
}

// ── Lowdefy page model ────────────────────────────────────────────────────────

type page struct {
	ID         string    `yaml:"id"`
	Type       string    `yaml:"type"`
	Properties pageProps `yaml:"properties"`
	Requests   []request `yaml:"requests,omitempty"`
	Blocks     []block   `yaml:"blocks"`
}

type pageProps struct {
	Title string `yaml:"title"`
}

type request struct {
	ID           string         `yaml:"id"`
	Type         string         `yaml:"type"`
	ConnectionID string         `yaml:"connectionId"`
	Payload      map[string]any `yaml:"payload,omitempty"`
	Properties   map[string]any `yaml:"properties"`
}

type block struct {
	ID         string         `yaml:"id"`
	Type       string         `yaml:"type"`
	Properties map[string]any `yaml:"properties,omitempty"`
	Events     map[string]any `yaml:"events,omitempty"`
}

const genHeader = "# GENERATED by tools/admin-gen (ADR-0012). Do not edit; run `mise run gen:admin`.\n"

func writePage(svc, name string, pg page) (string, error) {
	for i := range pg.Requests {
		if pg.Requests[i].ConnectionID == "" {
			pg.Requests[i].ConnectionID = svc
		}
	}
	rel := filepath.Join("_generated", svc, name+".yaml")
	err := marshalFile(filepath.Join(adminDir, rel), pg)
	if err != nil {
		return "", err
	}
	return rel, nil
}

func writeManifest(generated []string) error {
	static, err := staticRefs()
	if err != nil {
		return err
	}
	all := make([]string, 0, len(static)+len(generated))
	all = append(all, static...)
	all = append(all, generated...)
	var refs []any
	for _, r := range all {
		refs = append(refs, map[string]any{"_ref": r})
	}
	return marshalFile(filepath.Join(outRoot, "pages.yaml"), refs)
}

// staticRefs lists the hand-written pages (pages/ and custom/) so the manifest is
// the single page index the root config references.
func staticRefs() ([]string, error) {
	var out []string
	for _, dir := range []string{"pages", "custom"} {
		top, err := filepath.Glob(filepath.Join(adminDir, dir, "*.yaml"))
		if err != nil {
			return nil, fmt.Errorf("glob %s: %w", dir, err)
		}
		nested, err := filepath.Glob(filepath.Join(adminDir, dir, "*", "*.yaml"))
		if err != nil {
			return nil, fmt.Errorf("glob %s: %w", dir, err)
		}
		matches := make([]string, 0, len(top)+len(nested))
		matches = append(matches, top...)
		matches = append(matches, nested...)
		sort.Strings(matches)
		for _, m := range matches {
			rel, err := filepath.Rel(adminDir, m)
			if err != nil {
				return nil, fmt.Errorf("rel %s: %w", m, err)
			}
			out = append(out, rel)
		}
	}
	return out, nil
}

func marshalFile(p string, v any) error {
	err := os.MkdirAll(filepath.Dir(p), 0o750)
	if err != nil {
		return fmt.Errorf("mkdir %s: %w", filepath.Dir(p), err)
	}
	var buf bytes.Buffer
	_, _ = buf.WriteString(genHeader)
	enc := yaml.NewEncoder(&buf)
	enc.SetIndent(2)
	err = enc.Encode(v)
	if err != nil {
		return fmt.Errorf("encode %s: %w", p, err)
	}
	err = enc.Close()
	if err != nil {
		return fmt.Errorf("close %s: %w", p, err)
	}
	err = os.WriteFile(p, buf.Bytes(), 0o600)
	if err != nil {
		return fmt.Errorf("write %s: %w", p, err)
	}
	return nil
}

// ── helpers ───────────────────────────────────────────────────────────────────

// pathToURL turns a spec path into a Lowdefy url: a plain string, or a
// _string_concat that splices path params from the request payload.
func pathToURL(p string) any {
	if !strings.Contains(p, "{") {
		return p
	}
	var parts []any
	cur := ""
	for i := 0; i < len(p); {
		if p[i] == '{' {
			j := strings.IndexByte(p[i:], '}')
			if cur != "" {
				parts = append(parts, cur)
				cur = ""
			}
			parts = append(parts, map[string]any{payloadKey: p[i+1 : i+j]})
			i += j + 1
			continue
		}
		cur += string(p[i])
		i++
	}
	if cur != "" {
		parts = append(parts, cur)
	}
	return map[string]any{concatKey: parts}
}

func sortedKeys[V any](m map[string]V) []string {
	out := make([]string, 0, len(m))
	for k := range m {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}

// title capitalizes a lower-case resource noun ("products" -> "Products").
func title(s string) string {
	if s == "" {
		return s
	}
	return strings.ToUpper(s[:1]) + s[1:]
}

// headerName turns a snake_case field into a label ("price_cents" -> "Price cents").
func headerName(s string) string {
	return title(strings.ReplaceAll(s, "_", " "))
}

// humanize turns a camelCase operationId into words ("refundCharge" -> "Refund charge").
func humanize(s string) string {
	var out []rune
	for i, r := range s {
		if i > 0 && r >= 'A' && r <= 'Z' {
			out = append(out, ' ', r+('a'-'A'))
			continue
		}
		out = append(out, r)
	}
	return title(string(out))
}
