export type ClientRecord = {
    Created?: null | Date;
    DOB_DAY: number | string;
    DOB_MONTH: number | string;
    DOB_YEAR: number | string;
    FirstName: string;
    Id: null | number;
    LastName: string;
    Nickname: string;
    Notes: string;
    Updated?: null | Date;
    UserId?: number;
    deleted_at?: null | Date;
    [key: string]: unknown;
};

export type DrugLogRecord = {
    Created?: string | null;
    Id: null | number;
    In: null | number;
    MedicineId: number;
    Notes: null | string;
    Out: null | number;
    PillboxItemId: number | null;
    ResidentId: number;
    Updated?: null | Date;
    [key: string]: unknown;
};

export type MedicineRecord = {
    Barcode: string | null;
    Directions: string | null;
    Drug: string;
    OtherNames: string;
    FillDateDay?: string | number;
    FillDateMonth?: string;
    FillDateYear?: string | number;
    [key: string]: unknown;
    Id: number | null;
    Notes: string | null;
    Active: boolean;
    OTC: boolean;
    ResidentId?: number | null;
    Strength: string | null;
};

export type PillboxRecord = {
    Id: number | null;
    ResidentId: number | null;
    Name: string;
    Notes: string | null;
    [key: string]: unknown;
};

export type PillboxItemRecord = {
    Id: number | null;
    ResidentId: number;
    PillboxId: number;
    MedicineId: number;
    Quantity: number;
};

// Technically not a record but an object with a collection of records
export type Client = {
    clientInfo: ClientRecord;
    drugLogList: DrugLogRecord[];
    medicineList: MedicineRecord[];
    pillboxList: PillboxRecord[];
    pillboxItemList: PillboxItemRecord[];
};

export const newMedicineRecord = {
    Barcode: '',
    Directions: '',
    Drug: '',
    OtherNames: '',
    Id: null,
    Notes: '',
    Active: true,
    ResidentId: null,
    Strength: ''
} as MedicineRecord;

export const newDrugLogRecord = {
    Id: null,
    MedicineId: 0,
    Notes: '',
    In: null,
    Out: null,
    PillboxItemId: null,
    ResidentId: 0
} as DrugLogRecord;

export const newResidentRecord = {
    Id: null,
    FirstName: '',
    LastName: '',
    Nickname: '',
    DOB_YEAR: '',
    DOB_MONTH: '',
    DOB_DAY: '',
    Notes: ''
} as ClientRecord;

export const newPillboxRecord = {
    Id: null,
    ResidentId: 0,
    Name: '',
    Notes: null
} as PillboxRecord;

export const newPillboxItemRecord = {
    Id: null,
    ResidentId: 0,
    PillboxId: 0,
    MedicineId: 0,
    Quantity: 1
} as PillboxItemRecord;
