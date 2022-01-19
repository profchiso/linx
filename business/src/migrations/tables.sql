-- Table: public.aliases

-- DROP TABLE public.aliases;

CREATE TABLE IF NOT EXISTS public.aliases
(
    id serial NOT NULL ,
    name character varying(255) COLLATE pg_catalog."default",
    "businessId" integer,
    "userId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT aliases_pkey PRIMARY KEY (id)
)


CREATE TABLE IF NOT EXISTS public."businessOwners"
(
    id serial NOT NULL ,
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
    id serial NOT NULL,
    "primaryWallet" integer DEFAULT 100000,
    "secondaryWallet" integer DEFAULT 0,
    "promoWallet" integer DEFAULT 20000,
    name character varying(255) COLLATE pg_catalog."default",
    alias character varying(255) COLLATE pg_catalog."default",
    "utilityBillImage" character varying(255) COLLATE pg_catalog."default",
    "businessPhoneNumber" character varying(255) COLLATE pg_catalog."default",
    "businessEmail" character varying(255) COLLATE pg_catalog."default",
    "tradingName" character varying(255) COLLATE pg_catalog."default",
    "businessType" character varying(255) COLLATE pg_catalog."default",
    "businessSubType" character varying(255) COLLATE pg_catalog."default",
    description character varying(255) COLLATE pg_catalog."default",
    "yearOfOperation" character varying(255) COLLATE pg_catalog."default",
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
    email character varying(255) COLLATE pg_catalog."default",
    "headOfficeAddress" character varying(255) COLLATE pg_catalog."default",
    "businessCategory" character varying(255) COLLATE pg_catalog."default",
    service character varying(255) COLLATE pg_catalog."default",
    "ownershipType" character varying(255) COLLATE pg_catalog."default",
    "prefferedBusinessNameOne" character varying(255) COLLATE pg_catalog."default",
    "prefferedBusinessNameTwo" character varying(255) COLLATE pg_catalog."default",
    "branchAddress" character varying(255) COLLATE pg_catalog."default",
    "branchCountry" character varying(255) COLLATE pg_catalog."default",
    "branchState" character varying(255) COLLATE pg_catalog."default",
    "branchLGA" character varying(255) COLLATE pg_catalog."default",
    "companyObjectives" character varying(255) COLLATE pg_catalog."default",
    "companyShareCapital" character varying(255) COLLATE pg_catalog."default",
    "businessLogo" character varying(255) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT businesses_pkey PRIMARY KEY (id)
)



CREATE TABLE IF NOT EXISTS public.directors
(
    id serial NOT NULL ,
    "firstName" character varying(255) COLLATE pg_catalog."default",
    "lastName" character varying(255) COLLATE pg_catalog."default",
    "middleName" character varying(255) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    phone character varying(255) COLLATE pg_catalog."default",
    "dateOfBirth" character varying(255) COLLATE pg_catalog."default",
    gender character varying(255) COLLATE pg_catalog."default",
    nationality character varying(255) COLLATE pg_catalog."default",
    state character varying(255) COLLATE pg_catalog."default",
    lga character varying(255) COLLATE pg_catalog."default",
    occupation character varying(255) COLLATE pg_catalog."default",
    address character varying(255) COLLATE pg_catalog."default",
    "idType" character varying(255) COLLATE pg_catalog."default",
    "idNumber" character varying(255) COLLATE pg_catalog."default",
    "idImage" character varying(255) COLLATE pg_catalog."default",
    passport character varying(255) COLLATE pg_catalog."default",
    signature character varying(255) COLLATE pg_catalog."default",
    "businessId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT directors_pkey PRIMARY KEY (id),
    CONSTRAINT "directors_businessId_fkey" FOREIGN KEY ("businessId")
        REFERENCES public.businesses (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

CREATE TABLE IF NOT EXISTS public.secretaries
(
    id serial NOT NULL ,
    "firstName" character varying(255) COLLATE pg_catalog."default",
    "lastName" character varying(255) COLLATE pg_catalog."default",
    "middleName" character varying(255) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    phone character varying(255) COLLATE pg_catalog."default",
    "dateOfBirth" character varying(255) COLLATE pg_catalog."default",
    gender character varying(255) COLLATE pg_catalog."default",
    nationality character varying(255) COLLATE pg_catalog."default",
    state character varying(255) COLLATE pg_catalog."default",
    lga character varying(255) COLLATE pg_catalog."default",
    occupation character varying(255) COLLATE pg_catalog."default",
    address character varying(255) COLLATE pg_catalog."default",
    "idType" character varying(255) COLLATE pg_catalog."default",
    "idNumber" character varying(255) COLLATE pg_catalog."default",
    "idImage" character varying(255) COLLATE pg_catalog."default",
    passport character varying(255) COLLATE pg_catalog."default",
    signature character varying(255) COLLATE pg_catalog."default",
    "businessId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT secretaries_pkey PRIMARY KEY (id),
    CONSTRAINT "secretaries_businessId_fkey" FOREIGN KEY ("businessId")
        REFERENCES public.businesses (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)


CREATE TABLE IF NOT EXISTS public.witnesses
(
    id serial NOT NULL,
    "firstName" character varying(255) COLLATE pg_catalog."default",
    "lastName" character varying(255) COLLATE pg_catalog."default",
    "middleName" character varying(255) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    phone character varying(255) COLLATE pg_catalog."default",
    "dateOfBirth" character varying(255) COLLATE pg_catalog."default",
    gender character varying(255) COLLATE pg_catalog."default",
    occupation character varying(255) COLLATE pg_catalog."default",
    address character varying(255) COLLATE pg_catalog."default",
    signature character varying(255) COLLATE pg_catalog."default",
    "businessId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT witnesses_pkey PRIMARY KEY (id),
    CONSTRAINT "witnesses_businessId_fkey" FOREIGN KEY ("businessId")
        REFERENCES public.businesses (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
