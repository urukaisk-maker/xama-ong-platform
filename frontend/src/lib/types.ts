export type UserMe = {
  id: string;
  email: string;
  full_name: string;
  site: string | null;
  role_id: number | null;
  active: boolean;
  created_at: string;
  role_name: string | null;
};

export type User = {
  id: string;
  email: string;
  full_name: string;
  site: string | null;
  role_id: number | null;
  active: boolean;
  created_at: string;
};

export type Role = {
  id: number;
  name: string;
};

export type InventorySummary = {
  total_products: number;
  total_batches: number;
  total_quantity_kg: number;
  expiring_soon_count: number;
  expiring_soon_kg: number;
};

export type Product = {
  id: string;
  name: string;
  category: string | null;
  unit: string;
  created_at: string;
};

export type Batch = {
  id: string;
  product_id: string;
  origin: string;
  quantity: string;
  expiry_date: string;
  status: string;
  created_at: string;
};

export type FamilySummary = {
  total_families: number;
  active_families: number;
  reus_families: number;
  tarragona_families: number;
  total_people: number;
};

export type Family = {
  id: string;
  reference_code: string;
  address: string | null;
  phone: string | null;
  adults: number;
  minors: number;
  dietary_restrictions: string | null;
  notes: string | null;
  site: string;
  active: boolean;
  created_at: string;
};

export type Delivery = {
  id: string;
  family_id: string;
  delivery_date: string;
  site: string;
  volunteer_id: string | null;
  status: string;
  notes: string | null;
  checked_in_at: string | null;
  created_at: string;
};

export type Shift = {
  id: string;
  shift_date: string;
  site: string;
  role: string;
  start_time: string;
  end_time: string;
  capacity: number;
  notes: string | null;
  created_at: string;
  assignments: {
    id: string;
    shift_id: string;
    user_id: string;
    user_name: string | null;
    user_email: string | null;
    hours: number | null;
    attended: boolean;
    notes: string | null;
    created_at: string;
  }[];
};

export type VolunteerHours = {
  user_id: string;
  full_name: string;
  total_hours: number;
  total_shifts: number;
  shifts_attended: number;
};

export type HoursSummary = {
  total_volunteers: number;
  total_hours: number;
  total_shifts_assigned: number;
  ranking: VolunteerHours[];
};

export type Ration = {
  id: string;
  date: string;
  target_rations: number;
  served_rations: number;
  notes: string | null;
  created_at: string;
};

export type RationSummary = {
  total_days: number;
  total_served: number;
  avg_served: number;
  target_total: number;
  compliance_pct: number;
};

export type Derivation = {
  id: string;
  reference_code: string;
  person_name: string | null;
  origin: string;
  reason: string | null;
  rations: number;
  notes: string | null;
  status: string;
  served_at: string | null;
  created_at: string;
};

export type ImpactMetrics = {
  total_products: number;
  total_batches: number;
  total_kg_recovered: number;
  expiring_soon_kg: number;
  total_families: number;
  active_families: number;
  total_people: number;
  reus_families: number;
  tarragona_families: number;
  total_deliveries: number;
  deliveries_done: number;
  deliveries_pending: number;
  nevera_served: number;
  nevera_target: number;
  nevera_compliance_pct: number;
  derivations_total: number;
  derivations_served: number;
  total_volunteers: number;
  total_volunteer_hours: number;
  total_shifts: number;
  co2_avoided_kg: number;
  generated_at: string;
};
