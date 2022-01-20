CREATE TABLE IF NOT EXISTS public.staffs
(
    id serial NOT NULL ,
    "firstName" character varying(255) COLLATE pg_catalog."default",
    "lastName" character varying(255) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    "phoneNumber" character varying(255) COLLATE pg_catalog."default",
    "dataOfBirth" character varying(255) COLLATE pg_catalog."default",
    "profilePix" character varying(255) COLLATE pg_catalog."default",
    address character varying(255) COLLATE pg_catalog."default",
    country character varying(255) COLLATE pg_catalog."default",
    state character varying(255) COLLATE pg_catalog."default",
    lga character varying(255) COLLATE pg_catalog."default",
    "bankName" character varying(255) COLLATE pg_catalog."default",
    "accountName" character varying(255) COLLATE pg_catalog."default",
    "accountNumber" integer,
    "walletId" integer,
    "walletBalance" numeric DEFAULT 0,
    "bankAccountBalance" numeric DEFAULT 0,
    status character varying(255) COLLATE pg_catalog."default" DEFAULT 'Active'::character varying,
    role character varying(255) COLLATE pg_catalog."default" DEFAULT 'staff'::character varying,
    "employmentType" character varying(255) COLLATE pg_catalog."default",
    "businessId" integer,
    bonus numeric DEFAULT 0,
    salary numeric DEFAULT 0,
    "staffSalary" numeric DEFAULT 0,
    deduction numeric DEFAULT 0,
    "totalPayable" numeric DEFAULT 0,
    "paymentAccount" character varying(255) COLLATE pg_catalog."default" DEFAULT 'wallet'::character varying,
    password character varying(255) COLLATE pg_catalog."default",
    "businessTradingName" character varying(255) COLLATE pg_catalog."default",
    "staffId" character varying(255) COLLATE pg_catalog."default",
    "businessAlias" character varying(255) COLLATE pg_catalog."default",
    "companyStaffId" character varying(255) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT staffs_pkey PRIMARY KEY (id)
)


alter table public.staffs
add staffSalary numeric default 0