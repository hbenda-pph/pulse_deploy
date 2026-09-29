// includes/vw_payments_for_kpi.js
module.exports = (companyId, projectId, rawDataset) =>
  publish("vw_payments_for_kpi", {
    type: "view",
    database: projectId,
    schema: "dashboards",
    description: "View PAYMENTS FOR KPI",
    tags: ["dashboards", "pulse", "vw_payments_for_kpi"]
  })
    .query(`
  SELECT TRIM(bu.name)                                                                        AS \`BU\`
       , TRIM(jt.name)                                                                        AS \`Job Type\`
       , p.customer_id                                                                        AS \`Customer ID\`
       , TRIM(c.name)                                                                         AS \`Customer Name\`
       , j.job_number                                                                         AS \`Job #\`
       , i.id                                                                                 AS \`Invoice #\`
       , j.project_id                                                                         AS \`Project #\`
       , TRIM(p.type)                                                                         AS \`Payment Type\`
       , NULL                                                                                 AS \`Payment Method\`
       , ROUND(p.total,2)                                                                     AS \`Amount\`
       , TRIM(p.memo)                                                                         AS \`Memo\`
       , TRIM(p.auth_code)                                                                    AS \`Authorizaton Code\`
       , p.date                                                                               AS \`date\`
       , DATE(\`pph-central.settings.fn_convert_utc_localtz\`(p.date, ${companyId}))          AS \`Paid On\`
       , DATE(\`pph-central.settings.fn_convert_utc_localtz\`(j.completed_on, ${companyId}))  AS \`Completion Date\`
       , TRIM(c.type)                                                                         AS \`Customer Type\`
       , TRIM(p.created_by)                                                                   AS \`Created By\`     
       , p.batch_number                                                                       AS \`Batch #\`
    FROM \`${projectId}.${rawDataset}.payment\`                                       p
    JOIN \`${projectId}.${rawDataset}.customer\`                                      c
      ON c.id                                                                                 = p.customer_id
    JOIN \`${projectId}.${rawDataset}.payment_applied_to\`                            pa
      ON pa.payment_id                                                                        = p.id
    JOIN \`${projectId}.${rawDataset}.invoice\`                                       i
      ON i.id                                                                                 = pa.applied_to
    LEFT JOIN \`${projectId}.${rawDataset}.job\`                                      j
      ON j.id                                                                                 = i.job_id
    LEFT JOIN \`${projectId}.bronze.job_type\`                                                   jt
      ON j.job_type_id                                                                        = jt.id
    LEFT JOIN \`${projectId}.bronze.business_unit\`                                              bu
      ON bu.id                                                                                = i.business_unit_id
   WHERE EXTRACT(YEAR FROM \`pph-central.settings.fn_convert_utc_localtz\`(p.date, ${companyId})) BETWEEN 2025 AND 2026
   ORDER BY p.date, p.customer_id
`);
