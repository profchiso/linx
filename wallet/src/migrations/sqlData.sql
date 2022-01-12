CREATE TABLE IF NOT EXISTS public.beneficiaries
(
    id serial NOT NULL ,
    "bankName" character varying(255) COLLATE pg_catalog."default" NOT NULL DEFAULT 'GTB'::character varying,
    "accountNumber" character varying(255) COLLATE pg_catalog."default" NOT NULL DEFAULT '0123456789'::character varying,
    "walletId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT beneficiaries_pkey PRIMARY KEY (id),
    CONSTRAINT beneficiaries_id_fkey FOREIGN KEY (id)
        REFERENCES public.wallets (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
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
    "creditType" "enum_transactions_creditType" DEFAULT 'wallet'::"enum_transactions_creditType",
    "ownersWalletId" integer NOT NULL,
    "recipientWalletId" integer NOT NULL,
    amount integer NOT NULL,
    "ownersWalletBalance" integer NOT NULL,
    "recipientWalletBalance" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT transactions_pkey PRIMARY KEY (id),
    CONSTRAINT transactions_id_fkey FOREIGN KEY (id)
        REFERENCES public.wallets (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

CREATE TABLE IF NOT EXISTS public.wallets
(
    id serial NOT NULL,
    name character varying(255) COLLATE pg_catalog."default",
    "businessId" integer,
    "userId" integer,
    "walletType" "enum_wallets_walletType" DEFAULT 'Primary'::"enum_wallets_walletType",
    credit integer,
    debit integer,
    balance integer,
    "walletId" integer,
    alias character varying(255) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT wallets_pkey PRIMARY KEY (id)
)


