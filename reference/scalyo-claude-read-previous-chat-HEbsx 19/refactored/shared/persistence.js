/**
 * Scalyo Persistence Layer
 * Supabase-first with localStorage fallback
 *
 * Required Supabase tables:
 *   - companies: id, auth_user_id, name, plan, created_at, updated_at
 *   - accounts: id, company_id, name, arr_mrr, health, risk, csm, created_at, updated_at
 *   - roadmap: id, company_id, items(jsonb), created_at, updated_at
 *   - wellbeing: id, company_id, data(jsonb), created_at, updated_at
 *   - kpi_data: id, company_id, period, kpis(jsonb), goals(jsonb), custom_kpis(jsonb), history(jsonb), created_at, updated_at
 *   - task_board: id, company_id, tasks(jsonb), created_at, updated_at
 *   - cal_events: id, company_id, events(jsonb), created_at, updated_at
 *   - account_todos: id, company_id, account_id, todos(jsonb), created_at, updated_at
 */

(function(window) {
  'use strict';

  // Initialize Scalyo namespace if it doesn't exist
  if (!window.Scalyo) {
    window.Scalyo = {};
  }

  // ─── SUPABASE CONFIGURATION ───
  const SUPABASE_URL = "https://qqxdaaivklanivzgtctk.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxeGRhYWl2a2xhbml2emd0Y3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjgzNzQsImV4cCI6MjA4ODYwNDM3NH0.6UptjImD4yxMjFfQ6tFZy9_25xE1Ry9H8q19WUmImBE";

  // Stripe payment links
  const STRIPE = {
    starter: "https://buy.stripe.com/bJebJ1amncpL7mBekAdfG01",
    growth: "https://buy.stripe.com/eVqbJ10LN61n5et90gdfG00",
    elite: "https://buy.stripe.com/eVqaEXeCD1L736l7WcdfG05"
  };

  // Initialize Supabase client
  const db = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

  // ─── GENERIC PERSISTENCE HELPERS ───
  const SB = {
    /**
     * Generic upsert with localStorage fallback
     * @param {string} table - Supabase table name
     * @param {string} companyId - Company ID
     * @param {object} payload - Data to save
     * @param {string} lsKey - localStorage key for caching
     * @returns {Promise<{error}>}
     */
    async save(table, companyId, payload, lsKey) {
      // Save to localStorage immediately (cache)
      if (lsKey) {
        try {
          localStorage.setItem(lsKey, JSON.stringify(payload));
        } catch (e) {
          console.warn('localStorage save failed:', e);
        }
      }

      if (!companyId) return { error: "no_company_id" };
      if (!db) return { error: "supabase_not_initialized" };

      try {
        const { error } = await db.from(table).upsert(
          { company_id: companyId, ...payload, updated_at: new Date().toISOString() },
          { onConflict: "company_id" }
        );
        return { error };
      } catch (e) {
        console.error(`SB.save error for table ${table}:`, e);
        return { error: e.message };
      }
    },

    /**
     * Upsert with composite key (company_id + secondary field)
     * @param {string} table - Supabase table name
     * @param {string} companyId - Company ID
     * @param {string} conflictCol - Secondary conflict column name
     * @param {any} conflictVal - Secondary conflict value
     * @param {object} payload - Data to save
     * @param {string} lsKey - localStorage key for caching
     * @returns {Promise<{error}>}
     */
    async saveWith(table, companyId, conflictCol, conflictVal, payload, lsKey) {
      if (lsKey) {
        try {
          localStorage.setItem(lsKey, JSON.stringify(payload));
        } catch (e) {
          console.warn('localStorage save failed:', e);
        }
      }

      if (!companyId) return { error: "no_company_id" };
      if (!db) return { error: "supabase_not_initialized" };

      try {
        const { error } = await db.from(table).upsert(
          { company_id: companyId, [conflictCol]: conflictVal, ...payload, updated_at: new Date().toISOString() },
          { onConflict: `company_id,${conflictCol}` }
        );
        return { error };
      } catch (e) {
        console.error(`SB.saveWith error for table ${table}:`, e);
        return { error: e.message };
      }
    },

    /**
     * Load data with localStorage fallback
     * @param {string} table - Supabase table name
     * @param {string} companyId - Company ID
     * @param {object} filter - Additional filters {column: value}
     * @param {string} lsKey - localStorage key for fallback
     * @returns {Promise<object|null>}
     */
    async load(table, companyId, filter, lsKey) {
      // Try Supabase first
      if (companyId && db) {
        try {
          let q = db.from(table).select("*").eq("company_id", companyId);
          if (filter) {
            Object.entries(filter).forEach(([k, v]) => {
              q = q.eq(k, v);
            });
          }
          const { data, error } = await q.maybeSingle();
          if (!error && data) return data;
        } catch (e) {
          console.warn(`SB.load error for table ${table}:`, e);
        }
      }

      // Fallback to localStorage
      if (lsKey) {
        try {
          const s = localStorage.getItem(lsKey);
          if (s) {
            return { _fromLS: true, ...JSON.parse(s) };
          }
        } catch (e) {
          console.warn('localStorage load failed:', e);
        }
      }

      return null;
    },

    /**
     * Delete an entry
     * @param {string} table - Supabase table name
     * @param {string} companyId - Company ID
     * @param {object} filter - Additional filters {column: value}
     * @returns {Promise<void>}
     */
    async remove(table, companyId, filter) {
      if (!companyId || !db) return;

      try {
        let q = db.from(table).delete().eq("company_id", companyId);
        if (filter) {
          Object.entries(filter).forEach(([k, v]) => {
            q = q.eq(k, v);
          });
        }
        await q;
      } catch (e) {
        console.error(`SB.remove error for table ${table}:`, e);
      }
    }
  };

  // ─── KPI HELPERS ───
  const KpiDB = {
    /**
     * Save monthly KPIs
     * @param {string} companyId - Company ID
     * @param {string} period - Period identifier (e.g., "2025-03")
     * @param {object} kpis - KPI data
     * @param {object} goals - Goal data
     */
    async saveMonthly(companyId, period, kpis, goals) {
      try {
        localStorage.setItem(`scalyo_kpis_${period}`, JSON.stringify({ kpis, goals }));
      } catch (e) {
        console.warn('localStorage save failed:', e);
      }

      if (!companyId || !db) return;

      try {
        await db.from("kpi_data").upsert(
          { company_id: companyId, period, kpis, goals, updated_at: new Date().toISOString() },
          { onConflict: "company_id,period" }
        );
      } catch (e) {
        console.error("KpiDB.saveMonthly error:", e);
      }
    },

    /**
     * Save custom KPIs
     * @param {string} companyId - Company ID
     * @param {array} customKpis - Custom KPI definitions
     * @param {array} kpiHistory - Historical KPI data
     */
    async saveCustom(companyId, customKpis, kpiHistory) {
      const payload = { custom_kpis: customKpis, history: kpiHistory };

      if (companyId && db) {
        try {
          await db.from("kpi_data").upsert(
            { company_id: companyId, period: "__custom__", ...payload, updated_at: new Date().toISOString() },
            { onConflict: "company_id,period" }
          );
        } catch (e) {
          console.error("KpiDB.saveCustom error:", e);
        }
      }

      try {
        localStorage.setItem("scalyo_custom_kpis", JSON.stringify(customKpis));
        localStorage.setItem("scalyo_kpi_history", JSON.stringify(kpiHistory));
      } catch (e) {
        console.warn('localStorage save failed:', e);
      }
    },

    /**
     * Save goals
     * @param {string} companyId - Company ID
     * @param {object} goals - Goals data
     */
    async saveGoals(companyId, goals) {
      if (companyId && db) {
        try {
          await db.from("kpi_data").upsert(
            { company_id: companyId, period: "__goals__", goals, updated_at: new Date().toISOString() },
            { onConflict: "company_id,period" }
          );
        } catch (e) {
          console.error("KpiDB.saveGoals error:", e);
        }
      }

      try {
        localStorage.setItem("scalyo_goals", JSON.stringify(goals));
      } catch (e) {
        console.warn('localStorage save failed:', e);
      }
    }
  };

  // ─── EXPORTS ───
  window.Scalyo.persistence = {
    db: db,
    SB: SB,
    KpiDB: KpiDB,
    STRIPE: STRIPE,
    SUPABASE_URL: SUPABASE_URL
  };

  // For backward compatibility
  window.Scalyo.db = db;
  window.Scalyo.SB = SB;
  window.Scalyo.STRIPE = STRIPE;

})(window);
