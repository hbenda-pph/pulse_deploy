// includes/vw_pulse_wip_data.js
module.exports = (companyId, projectId, rawDataset) =>
  publish("vw_pulse_wip_data", {
    type: "view",
    database: projectId,
    schema: "dashboards",
    description: "View PULSE WIP DATA",
    tags: ["dashboards", "pulse", "vw_pulse_wip_data"],
    dependencies: [`${projectId}.dashboards.vw_pulse_base`]
  })
    .query(`
  SELECT TRIM(j.business_unit_name)                                                           AS \`Business Unit\`
       , j.job_number                                                                         AS \`Job Number\`
       , TRIM(j.job_type_name)                                                                AS \`Job Type\`
       , j.customer_id                                                                        AS \`Customer Id\`
       , TRIM(j.customer_name)                                                                AS \`Customer Name\`
       , TRIM(j.customer_type)                                                                AS \`Customer Type\`
       , j.job_status                                                                         AS \`Status\`
       , j.project_number                                                                     AS \`Project\`
       , ROUND(j.total_invoice,2)                                                             AS \`Total\`
       , NULL                                                                                 AS \`Payments\`
       , DATE(\`pph-central.settings.fn_convert_utc_localtz\`(ap.start_appointment, ${companyId}))          AS \`Sched Date\`
       , DATE(\`pph-convert_utc_localtz\`(ap.next_appointment, ${companyId}))           AS \`Next Appt Start date\`
       , ap.total_appointments                                                                AS \`Total Appointments\`
       , TRIM(j.primary_technician)                                                           AS \`Primary Technician\`
       , ARRAY_TO_STRING(IFNULL(j.assigned_technicians, []), ', ')                            AS \`Assigned Technicians\`
       , TRIM(j.technician_sold_name)                                                         AS \`Sold By\`
       , ROUND(ib.bill_amount,2)                                                              AS \`Material Costs\`
       , ROUND(po1.total_equipment,2)                                                         AS \`Equip Costs\`
       , ROUND(po.purchase_order_total,2)                                                     AS \`PO Costs\`
       , j.summary                                                                            AS \`Summary\`
       , DATE(\`pph-central.settings.fn_convert_utc_localtz\`(ap.most_recent_appointment, ${companyId}))    AS \`Most Recent Appt Date\` 
    FROM \`${projectId}.dashboards.vw_pulse_base\`                                               j      
    LEFT JOIN \`${projectId}.${rawDataset}.inventory_bill\`                                   ib
      ON ib.job_id                                                                            = j.id        
    LEFT JOIN 
         (
          SELECT po.job_id
               , SUM(CASE WHEN item.skuType = 'Material' THEN item.cost ELSE 0 END)           AS total_material
               , SUM(CASE WHEN item.skuType = 'Equipment' THEN item.cost ELSE 0 END)          AS total_equipment
               , SUM(CASE WHEN item.skuType IS NULL THEN item.cost ELSE 0 END)                AS total_po             
            FROM \`${projectId}.bronze.purchase_order\` po,
          UNNEST(po.items) AS item
           GROUP BY po.job_id
         )                                                                                    po1   
      ON po1.job_id                                                                           = j.id
    LEFT JOIN 
         (
          SELECT job_id
               , SUM(total)                                                                   AS purchase_order_total
            FROM \`${projectId}.silver.vw_purchase_order\`                                       purchase_orders
           GROUP BY                                                                           purchase_orders.job_id
         )                                                                                    po   
      ON po.job_id                                                                            = j.id
    LEFT JOIN \`${projectId}.dashboards.vw_wip_appointments\`                                    ap
      ON ap.job_id                                                                            = j.id    
   WHERE (j.job_status                                                                        != 'Canceled'
     AND j.job_status                                                                         != 'Completed')
     AND DATE(ap.start_appointment)                                                           >= CURRENT_DATE() 
     AND EXTRACT(YEAR FROM ap.start_appointment)                                              <= 2026
   ORDER BY ap.start_appointment
`);
