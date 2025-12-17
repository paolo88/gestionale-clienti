-- Rimuove il "blocco" che impedisce di avere più fatturati nello stesso mese/anno
ALTER TABLE revenues DROP CONSTRAINT IF EXISTS revenues_client_id_company_id_period_key;

-- Se il vincolo avesse un nome diverso (capita), prova a cancellare l'indice unico
DROP INDEX IF EXISTS revenues_client_id_company_id_period_key;
