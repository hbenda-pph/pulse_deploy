SELECT TRIM(bu.name)                                                                        AS `BU`
     , TRIM(jt.name)                                                                        AS `Job Type`
     , p.customer_id                                                                        AS `Customer ID`
     , TRIM(c.name)                                                                         AS `Customer Name`
     , j.job_number                                                                         AS `Job #`
     , i.id                                                                                 AS `Invoice #`
     , j.project_id                                                                         AS `Project #`
     , TRIM(p.type)                                                                         AS `Payment Type`
     , NULL                                                                                 AS `Payment Method`
     , ROUND(pa.applied_amount,2)                                                           AS `Amount`
     , TRIM(p.memo)                                                                         AS `Memo`
     , TRIM(p.auth_code)                                                                    AS `Authorizaton Code`
     , p.date                                                                               AS `date`
     , DATE(pa.applied_on)                                                                  AS `Paid On`
     , DATE(`pph-central.settings.fn_convert_utc_localtz`(j.completed_on,1))                AS `Completion Date`
     , TRIM(c.type)                                                                         AS `Customer Type`
     , TRIM(p.created_by)                                                                   AS `Created By`     
     , p.batch_number                                                                       AS `Batch #`
  FROM `shape-mhs-1.servicetitan_shape_mhs_1.payment`                                       p
  JOIN `shape-mhs-1.servicetitan_shape_mhs_1.customer`                                      c
    ON c.id                                                                                 = p.customer_id
  JOIN `shape-mhs-1.servicetitan_shape_mhs_1.payment_applied_to`                            pa
    ON pa.payment_id                                                                        = p.id
  JOIN  shape-mhs-1.servicetitan_shape_mhs_1.invoice                                        i
    ON i.id                                                                                 = pa.applied_to
  LEFT JOIN `shape-mhs-1.servicetitan_shape_mhs_1.job`                                      j
    ON j.id                                                                                 = i.job_id
  LEFT JOIN `shape-mhs-1.bronze.job_type`                                                   jt
    ON j.job_type_id                                                                        = jt.id
  LEFT JOIN `shape-mhs-1.bronze.business_unit`                                              bu
    ON bu.id                                                                                = i.business_unit_id
 WHERE EXTRACT(YEAR FROM `pph-central.settings.fn_convert_utc_localtz`(p.date,1)) BETWEEN 2025 AND 2026
   AND p._fivetran_deleted = false
 ORDER BY p.date, p.customer_id
;