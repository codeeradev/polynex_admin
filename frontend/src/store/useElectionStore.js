import { create } from 'zustand';
import { electionApi } from '../api/electionApi';
import { setActiveElectionId } from '../api/axiosClient';

/**
 * Tracks the currently active election/campaign (Phase 2). Every
 * dashboard, table, and report re-scopes to whatever is selected here,
 * per the Data Scoping Rule in the feature spec.
 *
 * Deliberately NOT persisted to localStorage: on a fresh load we default
 * to whichever election the backend has flagged `status: 'active'`. A
 * manual switch during the session lives only in memory and resets on a
 * hard refresh — this keeps a stale selection from silently sticking
 * around across browser sessions or devices sharing an account.
 */
const useElectionStore = create((set, get) => ({
  activeElection: null, // { id, name, startDate, endDate, regionScope, status }
  elections: [],
  loading: false,
  initialized: false,
  error: null,

  setActiveElection: (election) => {
    setActiveElectionId(election?.id ?? null);
    set({ activeElection: election ?? null });
  },

  /** Idempotent — safe to call from every consumer's mount effect. */
  initializeElections: async () => {
    if (get().initialized || get().loading) return;
    set({ loading: true, error: null });
    try {
      const result = await electionApi.list();
      const elections = result.elections || result;
      const defaultElection = elections.find((e) => e.status === 'active') || elections[0] || null;

      set({ elections, initialized: true, loading: false });
      get().setActiveElection(defaultElection);
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to load elections.',
        loading: false,
        initialized: true,
      });
    }
  },

  refreshElections: async () => {
    set({ loading: true, error: null });
    try {
      const result = await electionApi.list();
      const elections = result.elections || result;
      set({ elections, loading: false });

      // If the active election was archived/removed elsewhere, fall back
      // to whatever is now active rather than pointing at stale data.
      const stillValid = elections.some((e) => e.id === get().activeElection?.id);
      if (!stillValid) {
        const fallback = elections.find((e) => e.status === 'active') || elections[0] || null;
        get().setActiveElection(fallback);
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to refresh elections.', loading: false });
    }
  },

  createElection: async (payload) => {
    set({ error: null });
    try {
      await electionApi.create(payload);
      await get().refreshElections();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create election.';
      set({ error: message });
      return { success: false, message };
    }
  },

  archiveElection: async (id) => {
    set({ error: null });
    try {
      await electionApi.archive(id);
      await get().refreshElections();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to archive election.';
      set({ error: message });
      return { success: false, message };
    }
  },

  activateElection: async (id) => {
    set({ error: null });
    try {
      await electionApi.activate(id);
      await get().refreshElections();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reactivate election.';
      set({ error: message });
      return { success: false, message };
    }
  },

  /** Called on logout — see useAuthStore.clearSession. */
  reset: () => {
    setActiveElectionId(null);
    set({ activeElection: null, elections: [], initialized: false, error: null });
  },
}));

export default useElectionStore;
