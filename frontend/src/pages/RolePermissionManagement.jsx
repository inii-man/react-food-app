import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
} from '@mui/material';
import {
  fetchRoles,
  fetchPermissions,
  fetchRoleById,
  updateRolePermissions,
  clearError,
} from '../store/slices/rbacSlice';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function RolePermissionManagement() {
  const dispatch = useDispatch();
  const { roles, permissions, loading, error } = useSelector((state) => state.rbac);
  const { user } = useSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [permissionGroups, setPermissionGroups] = useState({});

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchPermissions());
  }, [dispatch]);

  useEffect(() => {
    // Group permissions by resource
    const grouped = {};
    permissions.forEach((perm) => {
      const [resource] = perm.name.split('.');
      if (!grouped[resource]) {
        grouped[resource] = [];
      }
      grouped[resource].push(perm);
    });
    setPermissionGroups(grouped);
  }, [permissions]);

  useEffect(() => {
    if (selectedRole && openDialog) {
      dispatch(fetchRoleById(selectedRole.id)).then((result) => {
        if (result.payload) {
          const rolePerms = result.payload.permissions?.map((p) => 
            typeof p === 'string' ? p : p.name
          ) || [];
          setSelectedPermissions(rolePerms);
        } else {
          // Fallback to role.permissions if fetch fails
          const rolePerms = selectedRole.permissions?.map((p) => 
            typeof p === 'string' ? p : p.name
          ) || [];
          setSelectedPermissions(rolePerms);
        }
      });
    }
  }, [selectedRole, openDialog, dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedRole(null);
    setSelectedPermissions([]);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setOpenDialog(true);
  };

  const handlePermissionToggle = (permissionName) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionName)) {
        return prev.filter((p) => p !== permissionName);
      } else {
        return [...prev, permissionName];
      }
    });
  };

  const handleSelectAll = (resource) => {
    const resourcePerms = permissionGroups[resource]?.map((p) => p.name) || [];
    const allSelected = resourcePerms.every((p) => selectedPermissions.includes(p));
    
    if (allSelected) {
      setSelectedPermissions((prev) => 
        prev.filter((p) => !resourcePerms.includes(p))
      );
    } else {
      setSelectedPermissions((prev) => {
        const newPerms = [...prev];
        resourcePerms.forEach((p) => {
          if (!newPerms.includes(p)) {
            newPerms.push(p);
          }
        });
        return newPerms;
      });
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    
    try {
      await dispatch(
        updateRolePermissions({
          roleId: selectedRole.id,
          permissionNames: selectedPermissions,
        })
      ).unwrap();
      
      // Refresh roles list
      dispatch(fetchRoles());
      setOpenDialog(false);
      setSelectedRole(null);
      setSelectedPermissions([]);
    } catch (error) {
      console.error('Failed to update permissions:', error);
    }
  };

  const isPermissionChecked = (permissionName) => {
    return selectedPermissions.includes(permissionName);
  };

  const isAllResourcePermissionsSelected = (resource) => {
    const resourcePerms = permissionGroups[resource]?.map((p) => p.name) || [];
    return resourcePerms.length > 0 && resourcePerms.every((p) => selectedPermissions.includes(p));
  };

  // Check if user is superadmin
  const isSuperAdmin = user?.roles?.includes('superadmin') || user?.role === 'superadmin';

  if (!isSuperAdmin) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Access Denied. Only Super Admin can access this page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Role & Permission Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mt: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Roles" />
          <Tab label="Permissions" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Manage Roles
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Permissions</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>{role.id}</TableCell>
                      <TableCell>
                        <Chip 
                          label={role.name} 
                          color={role.name === 'superadmin' ? 'error' : role.name === 'admin' ? 'warning' : 'primary'}
                        />
                      </TableCell>
                      <TableCell>
                        {role.permissions?.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {role.permissions.slice(0, 3).map((perm) => (
                              <Chip
                                key={typeof perm === 'string' ? perm : perm.name}
                                label={typeof perm === 'string' ? perm : perm.name}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                            {role.permissions.length > 3 && (
                              <Chip
                                label={`+${role.permissions.length - 3} more`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No permissions
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleRoleSelect(role)}
                        >
                          Manage Permissions
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            All Permissions
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Guard Name</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell>{permission.id}</TableCell>
                      <TableCell>
                        <Chip label={permission.name} color="secondary" />
                      </TableCell>
                      <TableCell>{permission.guard_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>

      {/* Permission Management Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Manage Permissions for Role: <strong>{selectedRole?.name}</strong>
        </DialogTitle>
        <DialogContent>
          {Object.entries(permissionGroups).map(([resource, perms]) => (
            <Box key={resource} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isAllResourcePermissionsSelected(resource)}
                      indeterminate={
                        perms.some((p) => isPermissionChecked(p.name)) &&
                        !isAllResourcePermissionsSelected(resource)
                      }
                      onChange={() => handleSelectAll(resource)}
                    />
                  }
                  label={
                    <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                      {resource}
                    </Typography>
                  }
                />
              </Box>
              <Box sx={{ pl: 4, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {perms.map((perm) => (
                  <FormControlLabel
                    key={perm.id}
                    control={
                      <Checkbox
                        checked={isPermissionChecked(perm.name)}
                        onChange={() => handlePermissionToggle(perm.name)}
                      />
                    }
                    label={perm.name}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSavePermissions}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Save Permissions'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default RolePermissionManagement;

