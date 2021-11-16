CREATE TABLE IF NOT EXISTS public.aliases
(
    id integer NOT NULL DEFAULT nextval('aliases_id_seq'::regclass),
    name character varying(255) COLLATE pg_catalog."default",
    "businessId" integer,
    "userId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT aliases_pkey PRIMARY KEY (id)
)




CREATE TABLE IF NOT EXISTS public."businessOwners"
(
    id integer NOT NULL DEFAULT nextval('"businessOwners_id_seq"'::regclass),
    "firstName" character varying(255) COLLATE pg_catalog."default",
    "lastName" character varying(255) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    "idType" character varying(255) COLLATE pg_catalog."default",
    "idImage" character varying(255) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "businessOwners_pkey" PRIMARY KEY (id)
)

CREATE TABLE IF NOT EXISTS public.businesses
(
    id integer NOT NULL DEFAULT nextval('businesses_id_seq'::regclass),
    name character varying(255) COLLATE pg_catalog."default",
    "tradingName" character varying(255) COLLATE pg_catalog."default",
    "businessType" character varying(255) COLLATE pg_catalog."default",
    description character varying(255) COLLATE pg_catalog."default",
    "yearOfOperation" integer,
    address character varying(255) COLLATE pg_catalog."default",
    country character varying(255) COLLATE pg_catalog."default",
    "utilityBill" character varying(255) COLLATE pg_catalog."default",
    "registrationCertificate" character varying(255) COLLATE pg_catalog."default",
    "otherDocuments" character varying(255) COLLATE pg_catalog."default",
    tin character varying(255) COLLATE pg_catalog."default",
    "tinCertificate" character varying(255) COLLATE pg_catalog."default",
    "userId" integer,
    state character varying(255) COLLATE pg_catalog."default",
    "rcNumber" character varying(255) COLLATE pg_catalog."default",
    "utilityBillType" character varying(255) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT businesses_pkey PRIMARY KEY (id)
)