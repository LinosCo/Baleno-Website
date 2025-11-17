# Variabili d'Ambiente Railway - Sistema Pagamento

Aggiungere queste variabili d'ambiente su Railway Dashboard (Project Settings → Variables):

## Variabili Obbligatorie

### Email (Resend)
```
RESEND_API_KEY=re_YOUR_ACTUAL_RESEND_API_KEY
RESEND_FROM_EMAIL=Baleno San Zeno <noreply@balenosanzeno.it>
```

### Encryption (per cifrare chiavi Stripe nel database)
```
ENCRYPTION_KEY=GENERATE_A_RANDOM_32_CHAR_STRING
```
Esempio generazione chiave sicura:
```bash
openssl rand -hex 32
```

### Stripe (Opzionale - configurabile da Admin Panel)
```
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

## Variabili già Configurate ✅
- DATABASE_URL (PostgreSQL)
- FRONTEND_URL
- JWT_SECRET
- JWT_REFRESH_SECRET
- SMTP_* (per email legacy)

## Note
1. **RESEND_API_KEY**: Ottenere da https://resend.com (necessario per email transazionali)
2. **ENCRYPTION_KEY**: Deve essere una stringa casuale di 64 caratteri (32 byte in hex)
3. **STRIPE_SECRET_KEY**: Può essere configurato anche dall'Admin Panel dopo il deploy
4. Il sistema usa valori di default/warning se le variabili non sono presenti

## Deploy
Dopo aver aggiunto le variabili, Railway farà il redeploy automaticamente.
