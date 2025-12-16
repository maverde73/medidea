SELECT 'apparecchiature_bad_cliente' as check_name, COUNT(*) as count, GROUP_CONCAT(id) as ids FROM apparecchiature WHERE id_cliente NOT IN (SELECT id FROM clienti);
SELECT 'apparecchiature_bad_modello' as check_name, COUNT(*) as count, GROUP_CONCAT(id) as ids FROM apparecchiature WHERE id_modello IS NOT NULL AND id_modello NOT IN (SELECT id FROM modelli_apparecchiature);
SELECT 'attivita_bad_cliente' as check_name, COUNT(*) as count, GROUP_CONCAT(id) as ids FROM attivita WHERE id_cliente NOT IN (SELECT id FROM clienti);
SELECT 'attivita_bad_apparecchiatura' as check_name, COUNT(*) as count, GROUP_CONCAT(id) as ids FROM attivita WHERE id_apparecchiatura IS NOT NULL AND id_apparecchiatura NOT IN (SELECT id FROM apparecchiature);
