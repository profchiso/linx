CREATE TABLE IF NOT EXISTS public.notifications
(
    id serial ,
    "from" character varying(255) COLLATE pg_catalog."default",
    "to" character varying(255) COLLATE pg_catalog."default",
    "subject" character varying(255) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT notifications_pkey PRIMARY KEY (id)
)