CREATE TABLE IF NOT EXISTS production_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lot_id INT NOT NULL,
  operation_id INT NOT NULL,
  employee_id INT NOT NULL,
  pcs INT NOT NULL,
  entry_date DATE NOT NULL,
  entered_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE,
  FOREIGN KEY (operation_id) REFERENCES lot_operations(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (entered_by) REFERENCES users(id)
);

CREATE OR REPLACE VIEW v_production_valued AS
SELECT pe.id, pe.employee_id, pe.lot_id, pe.operation_id, pe.pcs, pe.entry_date,
       lo.rate_per_piece, (pe.pcs * lo.rate_per_piece) AS amount
FROM production_entries pe
JOIN lot_operations lo ON lo.id = pe.operation_id;
