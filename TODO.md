# TODO: Add New Endpoint for Group Project Evaluations

## Steps to Complete

- [ ] Add `getGroupProjectEvaluations` function to `server/controllers/admin/adminController.js`

  - Fetch the group by `groupId` and populate students/membersSnapshot.
  - Fetch all `ProjectEvaluation` documents for the group.
  - Structure the response as an array of students, each with parameters and marks.
  - Ensure only group members are included.

- [ ] Add new route `GET /api/admin/groups/:groupId/project-evaluations` to `server/routes/admin/adminRoutes.js`

  - Import the new function and add the route with `protectAdmin` middleware.

- [ ] Test the endpoint
  - Run the server and make a GET request to verify the response structure.
  - Check that it returns 16 records for 4 students and 4 parameters (if applicable).
