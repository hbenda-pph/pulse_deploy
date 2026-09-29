// includes/vw_pulse_canceled_jobs.js
module.exports = (companyId, projectId, rawDataset) =>
  publish("vw_pulse_canceled_jobs", {
    type: "view",
    database: projectId,
    schema: "dashboards",
    description: "View PULSE CANCELED JOBS",
    tags: ["dashboards", "pulse", "vw_pulse_canceled_jobs"],
    dependencies: [`${projectId}.dashboards.vw_pulse_base`]
  })
    .query(`
  SELECT TRIM(j.business_unit_name)                                                         AS \`Business Unit\`
       , ARRAY_TO_STRING(IFNULL(j.assigned_technicians, []), ', ')                          AS \`Technicians\`
       , j.camapign_name                                                                    AS \`Campaign\`
       , TRIM(j.job_type_name)                                                              AS \`Job Type\`
       , j.id                                                                               AS \`Job Id\`
       , j.job_number                                                                       AS \`Job\`
       , j.customer_id                                                                      AS \`Customer Id\`
       , TRIM(j.customer_name)                                                              AS \`Customer\`
       , ARRAY_TO_STRING(lo.array_address_street, ', ')                                     AS \`Location\`
       , ARRAY_TO_STRING(ccp.array_phones, ', ')                                            AS \`Phones\`     
       , ARRAY_TO_STRING(cce.array_emails, ', ')                                            AS \`Emails\`
       , \`pph-central.settings.fn_convert_utc_localtz\`(j.created_on, ${companyId})         AS \`Created On\`
       , \`pph-central.settings.fn_convert_utc_localtz\`(j.completed_on, ${companyId})       AS \`Canceled On\`
       , TRIM(jc.cancel_reason)                                                             AS \`Cancel Reason\`
       , TRIM(jc.cancel_memo)                                                               AS \`Cancel Memo\`
       , TRIM(jc.canceled_by)                                                               AS \`CanceledBy\`
    FROM \`${projectId}.dashboards.vw_pulse_base\`                                             j 
    LEFT JOIN 
       (
            SELECT customer_id                                                              AS customer_id
                 , ARRAY_AGG(DISTINCT(LOWER(TRIM(address_street))))                         AS array_address_street
              FROM \`${projectId}.${rawDataset}.location\`                                  location 
             WHERE active                                                                   IS TRUE
               AND address_latitude                                                         IS NOT NULL
               AND address_longitude                                                        IS NOT NULL
             GROUP BY customer_id
       )                                                                                    lo   
      ON lo.customer_id                                                                     = j.customer_id
    LEFT JOIN
       (
            SELECT customer_id                                                              AS customer_id
                 , ARRAY_AGG(DISTINCT(LOWER(TRIM(value))))                                  AS array_emails   
              FROM \`${projectId}.${rawDataset}.customer_contact\`                          customer_contact
             WHERE type                                                                     IN ('Email')
             GROUP BY customer_id
       )                                                                                    cce      
      ON cce.customer_id                                                                    = j.customer_id
    LEFT JOIN
       (
            SELECT customer_id                                                              AS customer_id
                 , ARRAY_AGG(DISTINCT(LOWER(TRIM(value))))                                  AS array_phones   
              FROM \`${projectId}.${rawDataset}.customer_contact\`                          customer_contact
             WHERE type                                                                     IN ('Phone', 'MobilePhone', 'Fax')
             GROUP BY customer_id           
       )                                                                                    ccp      
      ON ccp.customer_id                                                                    = j.customer_id
    LEFT JOIN
       (
            SELECT job_canceled_log.job_id                                                  AS job_id
                 , job_canceled_log.created_on                                              AS canceled_on
                 , job_cancel_reason.name                                                   AS cancel_reason
                 , job_canceled_log.memo                                                    AS cancel_memo               
                 , employee.name                                                            AS canceled_by
              FROM \`${projectId}.bronze.job_canceled_log\`                                    job_canceled_log
              LEFT JOIN \`${projectId}.bronze.job_cancel_reason\`                              job_cancel_reason
                ON job_cancel_reason.id                                                     = job_canceled_log.reason_id
              LEFT JOIN \`${projectId}.${rawDataset}.employee\`                             employee 
                ON employee.id                                                              = job_canceled_log.created_by_id
             WHERE job_canceled_log.active                                                  IS TRUE
       )                                                                                    jc
      ON jc.job_id                                                                          = j.id
    WHERE j.job_status                                                                      = 'Canceled'
     AND EXTRACT(YEAR FROM \`pph-central.settings.fn_convert_utc_localtz\`(j.completed_on, ${companyId})) BETWEEN 2025 AND 2026
   ORDER BY j.completed_on
`);
