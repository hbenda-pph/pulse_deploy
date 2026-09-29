// includes/vw_pulse_purchase_orders.js
module.exports = (companyId, projectId, rawDataset) =>
  publish("vw_pulse_purchase_orders", {
    type: "view",
    database: projectId,
    schema: "dashboards",
    description: "View PULSE PURCHASE ORDERS",
    tags: ["dashboards", "pulse", "vw_pulse_purchase_orders"]
  })
    .query(`
  SELECT TRIM(bu.name)                                                                        AS \`BU\`
       , TRIM(po.number)                                                                      AS \`PO #\`
       , TRIM(v.name)                                                                         AS \`Vendor\`
       , DATE(\`pph-central.settings.fn_convert_utc_localtz\`(po.date, ${companyId}))          AS \`Date Created\`
       , DATE(\`pph-central.settings.fn_convert_utc_localtz\`(j.created_on, ${companyId}))      AS \`Job Date\`
       , TRIM(t.name)                                                                         AS \`Technician\`
       , NULL                                                                                 AS \`IssuedBy\`
       , j.id                                                                                 AS \`Job Id\`
       , j.job_number                                                                         AS \`Job\`
       , i.id                                                                                 AS \`Invoice Id\`
       , i.reference_number                                                                   AS \`Invoice\`
       , c.id                                                                                 AS \`Customer Id\`
       , TRIM(c.name)                                                                         AS \`Customer\`          
       , ROUND(po.total,2)                                                                    AS \`Amount\`
       , TRIM(po.summary)                                                                     AS \`Description\`
    FROM \`${projectId}.bronze.purchase_order\`                                               po
    LEFT JOIN \`${projectId}.bronze.business_unit\`                                           bu
      ON bu.id                                                                                = po.business_unit_id
    LEFT JOIN \`${projectId}.bronze.vendor\`                                                  v
      ON v.id                                                                                 = po.vendor_id
    JOIN \`${projectId}.${rawDataset}.job\`                                                   j
      ON j.id                                                                                 = po.job_id
    LEFT JOIN \`${projectId}.bronze.technician\`                                              t
      ON t.id                                                                                 = po.technician_id
    LEFT JOIN \`${projectId}.${rawDataset}.invoice\`                                          i
      ON i.id                                                                                 = po.invoice_id 
    LEFT JOIN \`${projectId}.${rawDataset}.customer\`                                         c
      ON c.id                                                                                 = j.customer_id
   WHERE EXTRACT(YEAR FROM \`pph-central.settings.fn_convert_utc_localtz\`(po.date, ${companyId})) BETWEEN 2025 AND 2026
     AND po.job_id IS NOT NULL
   ORDER BY po.date, po.number
`);
