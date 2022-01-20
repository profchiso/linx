CREATE TABLE IF NOT EXISTS public.beneficiaries
(
    id serial NOT NULL ,
    "bankName" character varying(255) COLLATE pg_catalog."default" NOT NULL DEFAULT 'GTB'::character varying,
    "accountNumber" character varying(255) COLLATE pg_catalog."default" NOT NULL DEFAULT '0123456789'::character varying,
    "beneficiaryWalletId" integer NOT NULL,
    "ownersWalletId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT beneficiaries_pkey PRIMARY KEY (id)
)

CREATE TABLE IF NOT EXISTS public.businesses
(
    id serial NOT NULL ,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    "walletIds" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT businesses_pkey PRIMARY KEY (id)
)

CREATE TABLE IF NOT EXISTS public.transactions
(
    id serial NOT NULL,
    "creditType" character varying(255) COLLATE pg_catalog."default",
    "ownersWalletId" integer NOT NULL,
    "recipientWalletId" integer,
    "senderWalletId" integer,
    "businessId" integer NOT NULL,
    amount integer NOT NULL,
    "walletBalance" integer NOT NULL,
    "staffId" integer NOT NULL,
    "transactionReference" character varying(255) COLLATE pg_catalog."default",
    "transactionType" character varying(255) COLLATE pg_catalog."default",
    "transactionStatus" character varying(255) COLLATE pg_catalog."default",
    "transactionDescription" character varying(255) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT transactions_pkey PRIMARY KEY (id)
)

CREATE TABLE IF NOT EXISTS public.wallets
(
    id serial NOT NULL,
    name character varying(255) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    "businessId" integer,
    "userId" integer,
    "walletType" character varying(255) COLLATE pg_catalog."default",
    credit integer,
    debit integer,
    balance integer,
    "walletId" integer,
    alias character varying(255) COLLATE pg_catalog."default",
    category character varying(255) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT wallets_pkey PRIMARY KEY (id)
)


