import { create } from 'zustand';
import { adminApi } from '../api/adminApi';

/**
 * State for the SuperAdmin-only "Manage Admins" screen: listing admin
 * accounts, inviting new ones, and updating role/region/status.
 */
const useAdminStore = create((set, get) => ({
  admins: [],
  loading: false,
  error: null,

  fetchAdmins: async () => {
    set({ loading: true, error: null });
    try {
      const result = await adminApi.list();
      set({ admins: result.admins || result, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to load admins.',
        loading: false,
      });
    }
  },

  inviteAdmin: async (payload) => {
    set({ error: null });
    try {
      await adminApi.invite(payload);
      await get().fetchAdmins();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Invite failed.';
      set({ error: message });
      return { success: false, message };
    }
  },

  updateAdmin: async (id, payload) => {
    set({ error: null });
    try {
      await adminApi.update(id, payload);
      await get().fetchAdmins();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Update failed.';
      set({ error: message });
      return { success: false, message };
    }
  },

  disableAdmin: async (id) => {
    set({ error: null });
    try {
      await adminApi.disable(id);
      await get().fetchAdmins();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to disable admin.';
      set({ error: message });
      return { success: false, message };
    }
  },

  enableAdmin: async (id) => {
    set({ error: null });
    try {
      await adminApi.enable(id);
      await get().fetchAdmins();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to enable admin.';
      set({ error: message });
      return { success: false, message };
    }
  },
}));

export default useAdminStore;
