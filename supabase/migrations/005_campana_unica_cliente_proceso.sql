-- Un cliente solo puede tener una campaña por proceso electoral.
DELETE FROM campanas c
WHERE c.id NOT IN (
  SELECT DISTINCT ON (id_cliente, id_proceso_electoral) id
  FROM campanas
  ORDER BY id_cliente, id_proceso_electoral, creado_en ASC, id ASC
);

CREATE UNIQUE INDEX campanas_cliente_proceso_unique
  ON campanas (id_cliente, id_proceso_electoral);
