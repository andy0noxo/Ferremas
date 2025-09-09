-- CREAR DDBB
DROP DATABASE ferremas;
CREATE DATABASE ferremas;
USE ferremas;


-- CREAR TABLAS
-- Tabla de Roles
CREATE TABLE Rol (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de Sucursales
CREATE TABLE Sucursal (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL
);

-- Tabla de Usuarios
CREATE TABLE Usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rut VARCHAR(12) NOT NULL UNIQUE,
    rol_id INT NOT NULL,
    sucursal_id INT,
    FOREIGN KEY (rol_id) REFERENCES Rol(id),
    FOREIGN KEY (sucursal_id) REFERENCES Sucursal(id),
    INDEX (email)
);

-- Tabla de Marcas
CREATE TABLE Marca (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de Categorías
CREATE TABLE Categoria (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de Productos
CREATE TABLE Producto (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio INT NOT NULL,
    marca_id INT,
    categoria_id INT,
    FOREIGN KEY (marca_id) REFERENCES Marca(id),
    FOREIGN KEY (categoria_id) REFERENCES Categoria(id)
);

-- Tabla de Stock (por producto y sucursal)
CREATE TABLE Stock (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    sucursal_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 0,
    FOREIGN KEY (producto_id) REFERENCES Producto(id),
    FOREIGN KEY (sucursal_id) REFERENCES Sucursal(id),
    UNIQUE (producto_id, sucursal_id)
);

-- Tabla de Pedidos
CREATE TABLE Pedido (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente', 'aprobado', 'rechazado', 'preparado', 'despachado', 'entregado') DEFAULT 'pendiente',
    metodo_pago ENUM('debito', 'credito', 'transferencia'),
    direccion_envio TEXT,
    sucursal_retiro INT,
    
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id),
    FOREIGN KEY (sucursal_retiro) REFERENCES Sucursal(id)
);
ALTER TABLE Pedido ADD COLUMN total INT NOT NULL DEFAULT 0;

-- Tabla de Detalles de Pedido
CREATE TABLE DetallePedido (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario INT NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES Pedido(id),
    FOREIGN KEY (producto_id) REFERENCES Producto(id)
);

-- Tabla de Pagos
CREATE TABLE Pago (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NOT NULL,
    monto INT NOT NULL,
    metodo_pago ENUM('debito', 'credito', 'transferencia') NOT NULL,
    estado ENUM('pendiente', 'completado', 'fallido') DEFAULT 'pendiente',
    fecha_pago DATETIME,
    transbank_token VARCHAR(255),
    respuesta_transbank TEXT,
    FOREIGN KEY (pedido_id) REFERENCES Pedido(id)
);


-- INSERTAR PREDEFINIDOS
-- Insertar roles predefinidos
INSERT INTO Rol (nombre) VALUES
('Administrador'),
('Vendedor'),
('Bodeguero'),
('Contador'),
('Cliente');


-- VERIFICAR Y PROBAR
-- Datos de Prueba
INSERT INTO Sucursal (nombre, direccion) VALUES 
('Sucursal Santiago Centro', 'Av. Libertador 1000, Santiago');
INSERT INTO Sucursal (nombre, direccion) VALUES 
('Sucursal Santiago Centro2', 'Av. Libertador 1000, Santiago2');
INSERT INTO Marca (nombre) VALUES ('Bosch');
INSERT INTO Marca (nombre) VALUES ('Bosch2');
INSERT INTO Categoria (nombre) VALUES ('Herramientas Eléctricas');
INSERT INTO Categoria (nombre) VALUES ('Herramientas Eléctricas2');
INSERT INTO Producto (nombre, descripcion, precio, marca_id, categoria_id) 
VALUES ('Taladro X200', 'Taladro percutor 750W', 99.99, 1, 1);
INSERT INTO Producto (nombre, descripcion, precio, marca_id, categoria_id) 
VALUES ('Taladro X2002', 'Taladro percutor 750W2', 92, 2, 2);
INSERT INTO Usuario (nombre, email, contrasena, rut, rol_id, sucursal_id) 
VALUES ('Juan Pérez', 'admin@ferremas.cl', SHA2('Admin123', 256), '12345678-9', 1, 1);
INSERT INTO Stock (producto_id, sucursal_id, cantidad) 
VALUES (1, 1, 50);
INSERT INTO Stock (producto_id, sucursal_id, cantidad) 
VALUES (2, 2, 50);
INSERT INTO Usuario (nombre, email, contrasena, rut, rol_id, sucursal_id) 
VALUES ('Andrés Salcedo', 'an.salcedo@duocuc.cl', '$2b$10$0cyy79CrzmH.au6Ejt1o0OBFNiK7uqjmmicuO/N756RkC1Lx8TDV2', '19134035-3', 1, 1); -- contraseña Admin.123456789
-- Verificar tablas creadas
-- SHOW TABLES;
-- drop table USUARIO;
-- Verificar estructura de una tabla
-- DESCRIBE Usuario; -- Pago, DetallePedido, Pedido, Stock, Producto, Categoria, Marca, Usuario, Sucursal, Rol

-- Verificar datos de una tabla
-- Select * from Usuario; -- Pago, DetallePedido, Pedido, Stock, Producto, Categoria, Marca, Usuario, Sucursal, Rol
