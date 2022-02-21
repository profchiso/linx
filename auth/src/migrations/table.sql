CREATE TABLE IF NOT EXISTS public."Users"
(
    id serial NOT NULL ,
    "firstName" character varying(255) COLLATE pg_catalog."default",
    "lastName" character varying(255) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    "verificationCode" integer,
    password character varying(255) COLLATE pg_catalog."default",
    phone character varying(255) COLLATE pg_catalog."default",
    "idType" character varying(255) COLLATE pg_catalog."default",
    "idImage" character varying(255) COLLATE pg_catalog."default",
    "profilePix" character varying(255) COLLATE pg_catalog."default",
    "isVerified" boolean DEFAULT false,
    "isDeactivated" boolean DEFAULT false,
    "deactivationReason" character varying(255) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "Users_pkey" PRIMARY KEY (id)
)
