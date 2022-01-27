CREATE TABLE IF NOT EXISTS public.payrolls
(
    id serial NOT NULL ,
    "businessId" integer,
    "businessTradingName" character varying(255) COLLATE pg_catalog."default",
    "businessEmail" character varying(255) COLLATE pg_catalog."default",
    phone character varying(255) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    "fullName" character varying(255) COLLATE pg_catalog."default",
    salary numeric,
    bonus numeric,
    deduction numeric,
    "totalPayable" numeric,
    "paymentAccountType" character varying(255) COLLATE pg_catalog."default" DEFAULT 'Wallet'::character varying,
    "batchId" character varying(255) COLLATE pg_catalog."default",
    "staffId" character varying(255) COLLATE pg_catalog."default",
    "businessPaymentWallet" character varying(255) COLLATE pg_catalog."default",
    "staffWallet" character varying(255) COLLATE pg_catalog."default",
    "totalAmount" numeric,
    "transactionType" character varying(255) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT payrolls_pkey PRIMARY KEY (id)
)
