CREATE TABLE IF NOT EXISTS public.customers
(
    id serial ,
    "businessName" character varying(255) COLLATE pg_catalog."default",
    "businessEmail" character varying(255) COLLATE pg_catalog."default",
    "businessPhoneNumber" character varying(255) COLLATE pg_catalog."default",
    website character varying(255) COLLATE pg_catalog."default",
    "companyLogo" character varying(255) COLLATE pg_catalog."default",
    address character varying(255) COLLATE pg_catalog."default",
    country character varying(255) COLLATE pg_catalog."default",
    state character varying(255) COLLATE pg_catalog."default",
    lga character varying(255) COLLATE pg_catalog."default",
    "firstName" character varying(255) COLLATE pg_catalog."default",
    "lastName" character varying(255) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    "phoneNumber" character varying(255) COLLATE pg_catalog."default",
    alias character varying(255) COLLATE pg_catalog."default",
    "businessId" integer,
    status enum_customers_status DEFAULT 'active'::enum_customers_status,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT customers_pkey PRIMARY KEY (id)
)