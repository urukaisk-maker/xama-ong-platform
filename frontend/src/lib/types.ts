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
