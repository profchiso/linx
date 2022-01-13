CREATE TABLE IF NOT EXISTS public.payrolls
(
    id serial NOT NULL ,
    "businessId" integer,
    "businessTradingName" character varying(255) COLLATE pg_catalog."default",
    fullname character varying(255) COLLATE pg_catalog."default",
    salary integer,
    bonus integer,
    deduction integer,
    "totalPayable" integer,
    "paymentAccountType" character varying(255) COLLATE pg_catalog."default" DEFAULT 'Wallet'::character varying,
    "batchId" character varying(255) COLLATE pg_catalog."default",
    "staffId" integer,
    "businessPaymentWallet" integer,
    "staffWallet" integer,
    "transactionType" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT payrolls_pkey PRIMARY KEY (id)
)
