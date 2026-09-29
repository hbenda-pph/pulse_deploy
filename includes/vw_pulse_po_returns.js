// includes/vw_pulse_po_returns.js
module.exports = (companyId, projectId, rawDataset) =>
  publish("vw_pulse_po_returns", {
    type: "view",
    database: projectId,
    schema: "dashboards",
    description: "View PULSE PO RETURNS",
    tags: ["dashboards", "pulse", "vw_pulse_po_returns"]
  })
    .query(`
  SELECT TRIM(bu.name)                                                                        AS \`BU\`
       , r.number                                                                             AS \`Return #\`
       , TRIM(v.name)                                                                         AS \`Vendor\`
       , DATE(\`pph-central.settings.fn_convert_utc_localtz\`(r.return_date, ${companyId}))   AS \`Date Created\`
       , NULL                                                                                 AS \`IssuedBy\`
       , j.job_number                                                                         AS \`Job\`
       , j.job_status                                                                         AS \`Job Status\`     
       , CASE WHEN r.active IS TRUE THEN 'Active' ELSE 'Inactive' END                         AS \`Trans Status\`
       , c.id                                                                                 AS \`Customer Id\`
       , TRIM(c.name)                                                                         AS \`Customer\`          
       , ROUND(r.return_amount,2)                                                             AS \`Amount\`
       , TRIM(r.memo)                                                                         AS \`Memo\`
    FROM \`${projectId}.bronze.return\`                                                       r
    LEFT JOIN \`${projectId}.bronze.business_unit\`                                           bu
      ON bu.id                                                                                = r.business_unit_id
    LEFT JOIN \`${projectId}.bronze.vendor\`                                                  v
      ON v.id                                                                                 = r.vendor_id
    JOIN \`${projectId}.${rawDataset}.job\`                                                   j
      ON j.id                                                                                 = r.job_id
   LEFT JOIN \`${projectId}.${rawDataset}.customer\`                                          c
      ON c.id                                                                                 = j.customer_id
   WHERE EXTRACT(YEAR FROM \`pph-central.settings.fn_convert_utc_localtz\`(r.return_date, ${companyId})) BETWEEN 2025 AND 2026
     AND EXTRACT(YEAR FROM r.return_date)                                                     >= 2025
     AND r.active IS TRUE
   ORDER BY r.return_date,r.number
`);
