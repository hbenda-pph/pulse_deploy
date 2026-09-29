SELECT j.id, j.job_number, j.customer_id, j.job_generated_lead_source_job_id, j.job_generated_lead_source_employee_id, j.completed_on, j.created_on, j.summary, j.job_status, j.location_id
     , jt.name AS job_type_name
     , p.number AS project_number
     , bu.name AS business_unit_name
     , c.name AS customer_name, c.type AS customer_type
     , ca.name AS camapign_name
     , ts.name AS technician_sold_name
     , t.name AS technician_name
     , ti.assigned_technicians,ti.primary_technician
     , it.total_invoice     
  FROM `shape-mhs-1.servicetitan_shape_mhs_1.job`                                           j
  LEFT JOIN `shape-mhs-1.bronze.job_type`                                                   jt
    ON jt.id                                                                                = j.job_type_id
  LEFT JOIN `shape-mhs-1.servicetitan_shape_mhs_1.project`                                  p
    ON p.id                                                                                 = j.project_id
  LEFT JOIN `shape-mhs-1.servicetitan_shape_mhs_1.business_unit`                            bu
    ON bu.id                                                                                = j.business_unit_id
  LEFT JOIN `shape-mhs-1.servicetitan_shape_mhs_1.customer`                                 c
    ON c.id                                                                                 = j.customer_id
  LEFT JOIN `shape-mhs-1.bronze.campaign`                                                   ca
    ON ca.id                                                                                = j.campaign_id
  LEFT JOIN `shape-mhs-1.bronze.technician`                                                 ts
    ON ts.id                                                                                = j.sold_by_id
  LEFT JOIN `shape-mhs-1.bronze.technician`                                                 t
    ON t.id                                                                                 = j.job_generated_lead_source_employee_id
  LEFT JOIN 
       (
        SELECT js.job_id                                                                    AS job_id
             , ARRAY_AGG(DISTINCT IFNULL(t.name, ''))                                       AS assigned_technicians
             , ARRAY_AGG(IFNULL(t.name, '') ORDER BY js.split DESC LIMIT 1)[SAFE_OFFSET(0)] AS primary_technician
          FROM `shape-mhs-1.servicetitan_shape_mhs_1.job_split`                             js
          LEFT JOIN `shape-mhs-1.bronze.technician`                                         t 
            ON js.technician_id                                                             = t.id
         GROUP BY                                                                           js.job_id
       )                                                                                    ti 
    ON ti.job_id                                                                            = j.id
  LEFT JOIN 
       (
        SELECT invoice_total.job_id                                                         AS job_id
             , SUM(invoice_total.sub_total)                                                 AS total_invoice
          FROM `shape-mhs-1.servicetitan_shape_mhs_1.invoice`                               invoice_total
         GROUP BY invoice_total.job_id
       )                                                                                    it
    ON it.job_id                                                                            = j.id
;