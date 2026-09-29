SELECT TRIM(bu.name)                                                                        AS `BU`
     , TRIM(po.number)                                                                      AS `PO #`
     , TRIM(v.name)                                                                         AS `Vendor`
     , DATE(`pph-central.settings.fn_convert_utc_localtz`(po.date,1))                       AS `Date Created`
     , DATE(`pph-central.settings.fn_convert_utc_localtz`(j.created_on,1))                  AS `Job Date`
     , TRIM(t.name)                                                                         AS `Technician`
     , NULL                                                                                 AS `IssuedBy`
     , j.id                                                                                 AS `Job Id`
     , j.job_number                                                                         AS `Job`
     , i.id                                                                                 AS `Invoice Id`
     , i.reference_number                                                                   AS `Invoice`
     , c.id                                                                                 AS `Customer Id`
     , TRIM(c.name)                                                                         AS `Customer`          
     , ROUND(po.total,2)                                                                    AS `Amount`
     , TRIM(po.summary)                                                                     AS `Description`
  FROM `shape-mhs-1.bronze.purchase_order`                                                  po
  LEFT JOIN `shape-mhs-1.bronze.business_unit`                                              bu
    ON bu.id                                                                                = po.business_unit_id
  LEFT JOIN `shape-mhs-1.bronze.vendor`                                                     v
    ON v.id                                                                                 = po.vendor_id
  JOIN `shape-mhs-1.servicetitan_shape_mhs_1.job`                                           j
    ON j.id                                                                                 = po.job_id
  LEFT JOIN `shape-mhs-1.bronze.technician`                                                 t
    ON t.id                                                                                 = po.technician_id
  LEFT JOIN `shape-mhs-1.servicetitan_shape_mhs_1.invoice`                                  i
    ON i.id                                                                                 = po.invoice_id 
 LEFT JOIN `shape-mhs-1.servicetitan_shape_mhs_1.customer`                                  c
    ON c.id                                                                                 = j.customer_id
 WHERE EXTRACT(YEAR FROM `pph-central.settings.fn_convert_utc_localtz`(po.date,1)) BETWEEN 2025 AND 2026
   AND po.job_id IS NOT NULL
ORDER BY po.date, po.number
;