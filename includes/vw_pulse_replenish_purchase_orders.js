// includes/vw_pulse_replenish_purchase_orders.js
module.exports = (companyId, projectId, rawDataset) =>
  publish("vw_pulse_replenish_purchase_orders", {
    type: "view",
    database: projectId,
    schema: "dashboards",
    description: "View PULSE REPLENISH PURCHASE ORDERS",
    tags: ["dashboards", "pulse", "vw_pulse_replenish_purchase_orders"]
  })
    .query(`
  SELECT TRIM(bu.name)                                                                        AS \`BU\`
       , TRIM(po.number)                                                                      AS \`PO #\`
       , TRIM(v.name)                                                                         AS \`Vendor\`
       , DATE(\`pph-central.settings.fn_convert_utc_localtz\`(po.date, ${companyId}))          AS \`Date Created\`
       , NULL                                                                                 AS \`Job Date\`
       , TRIM(t.name)                                                                         AS \`Technician\`
       , NULL                                                                                 AS \`IssuedBy\`
       , NULL                                                                                 AS \`Job Id\`
       , NULL                                                                                 AS \`Job\`
       , NULL                                                                                 AS \`Invoice Id\`
       , NULL                                                                                 AS \`Invoice\`
       , NULL                                                                                 AS \`Customer Id\`
       , NULL                                                                                 AS \`Customer\`          
       , ROUND(po.total,2)                                                                    AS \`Amount\`
       , TRIM(po.summary)                                                                     AS \`Description\`
    FROM \`${projectId}.bronze.purchase_order\`                                               po
    LEFT JOIN \`${projectId}.bronze.business_unit\`                                           bu
      ON bu.id                                                                                = po.business_unit_id
    LEFT JOIN \`${projectId}.bronze.vendor\`                                                  v
      ON v.id                                                                                 = po.vendor_id
    LEFT JOIN \`${projectId}.${rawDataset}.job\`                                              j
      ON j.id                                                                                 = po.job_id
    LEFT JOIN \`${projectId}.bronze.technician\`                                              t
      ON t.id                                                                                 = po.technician_id
    LEFT JOIN \`${projectId}.${rawDataset}.invoice\`                                          i
      ON i.id                                                                                 = po.invoice_id 
    LEFT JOIN \`${projectId}.${rawDataset}.customer\`                                         c
      ON c.id                                                                                 = j.customer_id
   WHERE EXTRACT(YEAR FROM \`pph-central.settings.fn_convert_utc_localtz\`(po.date, ${companyId})) BETWEEN 2025 AND 2026
     AND EXTRACT(YEAR FROM po.date)                                                           >= 2025
     AND po.job_id IS NULL
   ORDER BY po.date, po.number
`);
