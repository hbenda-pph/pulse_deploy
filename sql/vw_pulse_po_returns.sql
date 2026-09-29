SELECT TRIM(bu.name)                                                                        AS `BU`
     , r.number                                                                             AS `Return #`
     , TRIM(v.name)                                                                         AS `Vendor`
     , DATE(`pph-central.settings.fn_convert_utc_localtz`(r.return_date,1))                 AS `Date Created`
     , NULL                                                                                 AS `IssuedBy`
     , j.job_number                                                                         AS `Job`
     , j.job_status                                                                         AS `Job Status`     
     , CASE WHEN r.active IS TRUE THEN 'Active' ELSE 'Inactive' END                         AS `Trans Status`
     , c.id                                                                                 AS `Customer Id`
     , TRIM(c.name)                                                                         AS `Customer`          
     , ROUND(r.return_amount,2)                                                             AS `Amount`
     , TRIM(r.memo)                                                                         AS `Memo`
  FROM `shape-mhs-1.bronze.return`                                                          r
  LEFT JOIN `shape-mhs-1.bronze.business_unit`                                              bu
    ON bu.id                                                                                = r.business_unit_id
  LEFT JOIN `shape-mhs-1.bronze.vendor`                                                     v
    ON v.id                                                                                 = r.vendor_id
  JOIN `shape-mhs-1.servicetitan_shape_mhs_1.job`                                           j
    ON j.id                                                                                 = r.job_id
 LEFT JOIN `shape-mhs-1.servicetitan_shape_mhs_1.customer`                                  c
    ON c.id                                                                                 = j.customer_id
 WHERE EXTRACT(YEAR FROM `pph-central.settings.fn_convert_utc_localtz`(r.return_date,1)) BETWEEN 2025 AND 2026
   AND EXTRACT(YEAR FROM r.return_date)                                                     >= 2025
   AND r.active IS TRUE
ORDER BY r.return_date,r.number
;