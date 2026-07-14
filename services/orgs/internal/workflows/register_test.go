package workflows

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"go.temporal.io/sdk/activity"
	"go.temporal.io/sdk/testsuite"
)

const (
	testID    = "id_1"
	testEmail = "a@example.com"
)

// registerEnv registers stub activities under the names RegisterUser executes, so
// the test env resolves and mocks them without the real orgs DB / SpiceDB writer.
func registerEnv(ts *testsuite.WorkflowTestSuite) *testsuite.TestWorkflowEnvironment {
	env := ts.NewTestWorkflowEnvironment()
	env.RegisterActivityWithOptions(
		func(context.Context, string, string) (string, error) { return "", nil },
		activity.RegisterOptions{Name: "CreatePersonalOrgActivity"},
	)
	env.RegisterActivityWithOptions(
		func(context.Context, string, string) error { return nil },
		activity.RegisterOptions{Name: "GrantOrgAdminActivity"},
	)
	return env
}

func TestRegisterUserWorkflow(t *testing.T) {
	t.Parallel()

	t.Run(
		"creates the personal org then grants admin on it",
		func(t *testing.T) {
			t.Parallel()
			var ts testsuite.WorkflowTestSuite
			env := registerEnv(&ts)
			env.OnActivity("CreatePersonalOrgActivity", mock.Anything, testID, testEmail).
				Return("org_1", nil).Once()
			env.OnActivity("GrantOrgAdminActivity", mock.Anything, "org_1", testID).
				Return(nil).Once()

			env.ExecuteWorkflow(RegisterUser, RegisterInput{IdentityID: testID, Email: testEmail})

			require.True(t, env.IsWorkflowCompleted())
			require.NoError(t, env.GetWorkflowError())
			env.AssertExpectations(t)
		},
	)

	t.Run(
		"org creation failure fails the workflow and never grants admin",
		func(t *testing.T) {
			t.Parallel()
			var ts testsuite.WorkflowTestSuite
			env := registerEnv(&ts)
			env.OnActivity("CreatePersonalOrgActivity", mock.Anything, mock.Anything, mock.Anything).
				Return("", errors.New("db down"))

			env.ExecuteWorkflow(RegisterUser, RegisterInput{IdentityID: testID, Email: testEmail})

			require.True(t, env.IsWorkflowCompleted())
			require.Error(t, env.GetWorkflowError())
			env.AssertNotCalled(t, "GrantOrgAdminActivity", mock.Anything, mock.Anything, mock.Anything)
		},
	)

	t.Run(
		"SpiceDB grant failure fails the workflow after the org is created",
		func(t *testing.T) {
			t.Parallel()
			var ts testsuite.WorkflowTestSuite
			env := registerEnv(&ts)
			env.OnActivity("CreatePersonalOrgActivity", mock.Anything, mock.Anything, mock.Anything).
				Return("org_1", nil).Once()
			env.OnActivity("GrantOrgAdminActivity", mock.Anything, "org_1", testID).
				Return(errors.New("spicedb down"))

			env.ExecuteWorkflow(RegisterUser, RegisterInput{IdentityID: testID, Email: testEmail})

			require.True(t, env.IsWorkflowCompleted())
			require.Error(t, env.GetWorkflowError())
		},
	)
}
