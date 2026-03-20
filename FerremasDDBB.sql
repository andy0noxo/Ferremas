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
    imagen_url VARCHAR(500),
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

-- Sucursal
INSERT INTO Sucursal (nombre, direccion) VALUES 
('Sucursal Santiago, La Florida', 'Froilán Roa 7107, 8240000 La Florida, Región Metropolitana');
INSERT INTO Sucursal (nombre, direccion) VALUES 
('Sucursal Valparaíso', 'Pedro Montt 1881, 2362936 Valparaíso');

-- Marca
INSERT INTO Marca (nombre) VALUES ('Bauker');
INSERT INTO Marca (nombre) VALUES ('Makita');
INSERT INTO Marca (nombre) VALUES ('Black+decker');
INSERT INTO Marca (nombre) VALUES ('Lernen');
INSERT INTO Marca (nombre) VALUES ('Ubermann');
INSERT INTO Marca (nombre) VALUES ('Dewalt');
INSERT INTO Marca (nombre) VALUES ('Brooklyn');
INSERT INTO Marca (nombre) VALUES ('Total tools');
INSERT INTO Marca (nombre) VALUES ('Bosch');
INSERT INTO Marca (nombre) VALUES ('Daewoo');

-- Categoria
INSERT INTO Categoria (nombre) VALUES ('Taladros');
INSERT INTO Categoria (nombre) VALUES ('Esmeriles');
INSERT INTO Categoria (nombre) VALUES ('Sierras');
INSERT INTO Categoria (nombre) VALUES ('Lijadoras');
INSERT INTO Categoria (nombre) VALUES ('Cepillos');
INSERT INTO Categoria (nombre) VALUES ('Fresadoras');
INSERT INTO Categoria (nombre) VALUES ('Rotomartillos y demoledores');
INSERT INTO Categoria (nombre) VALUES ('Pistolas de calor');
INSERT INTO Categoria (nombre) VALUES ('Atornilladores');
INSERT INTO Categoria (nombre) VALUES ('Accesorios de Herramientas eléctricas');

-- Producto
INSERT INTO Producto (nombre, descripcion, precio, imagen_url, marca_id, categoria_id) 
VALUES ('Taladro Percutor Eléctrico 13 mm 900 W 220 V', 
'Taladro Percutor Eléctrico 13 mm 900 W 220 V
Dale vida a tus proyectos con el Kit Taladro Percutor Bauker ¡tu aliado perfecto para el hogar! 
Con 73 accesorios incluidos, este taladro de 900 W y 13 mm de mandril te permitirá realizar perforaciones en concreto, metal y madera con facilidad. 
Su diseño robusto y potente, junto a su práctico maletín, lo convierten en la herramienta ideal para cualquier trabajo, desde reparaciones menores hasta proyectos de carpintería más ambiciosos.', 
44790, 
'https://media.falabella.com/sodimacCL/8738599_001/w=1200,h=1200,fit=pad', 
1,
1);

INSERT INTO Producto (nombre, descripcion, precio, imagen_url, marca_id, categoria_id) 
VALUES ('Esmeril 4-1/2" Inalámbrico 18V + 2Bat 3,0ah + Cargador', 
'Esmeril 4-1/2" Inalámbrico 18V + 2Bat 3,0ah + Cargador
¡Potencia tus proyectos con el Esmeril Inalámbrico Makita! 
Diseñado para un uso industrial, este esmeril de 4-1/2" te ofrece la libertad de trabajar sin cables y con la fuerza de 18V. 
Incluye dos baterías de 3.0Ah y un cargador, para que nunca te quedes sin energía en el momento crucial.', 
249990, 
'https://media.falabella.com/sodimacCL/7857217_01/w=1200,h=1200,fit=pad', 
2, 
2);

INSERT INTO Producto (nombre, descripcion, precio, imagen_url, marca_id, categoria_id) 
VALUES ('Sierra Circular + Taladro Atornillador + Caladora BLACK+DECKER', 
'INCLUYE:
Sierra Circular 1400W BLACK+DECKER CS1004-LD008-KS501
1 Disco de corte 18 dientes con carburo de tungsteno
1 Guía paralela
Taladro Atornillador Inalámbrico 8V
1 batería integrada 1,5 Ah
1 cargador USB 600mA
1 punta doble phillips/estándar
Sierra Caladora 420W
1 Hoja para sierra', 
99990, 
'https://media.falabella.com/falabellaCL/119852924_01/w=1200,h=1200,fit=pad', 
3, 
3);

INSERT INTO Producto (nombre, descripcion, precio, imagen_url, marca_id, categoria_id) 
VALUES ('Lijadora Roto Orbital Lernen 350 W - Con Lijas De Repuesto', 
'Características LIJADORA ROTO ORBITAL:
- Potencia: 350 W
- Rotación Máxima: 12.000 rpm
- Diametro de lija: 125 mm
- 15 lijas de repuesto
5 unid P40
5 unid P80
5 unid P120
Garantía del vendedor: 12 meses', 
29990, 
'https://media.falabella.com/falabellaCL/126981582_01/w=1200,h=1200,fit=pad', 
4, 
4);

-- Stock
INSERT INTO Stock (producto_id, sucursal_id, cantidad) 
VALUES (1, 1, 500);
INSERT INTO Stock (producto_id, sucursal_id, cantidad) 
VALUES (1, 2, 500); 

INSERT INTO Stock (producto_id, sucursal_id, cantidad) 
VALUES (2, 1, 500);
INSERT INTO Stock (producto_id, sucursal_id, cantidad) 
VALUES (2, 2, 500);

INSERT INTO Stock (producto_id, sucursal_id, cantidad) 
VALUES (3, 1, 500);
INSERT INTO Stock (producto_id, sucursal_id, cantidad) 
VALUES (3, 2, 500);

INSERT INTO Stock (producto_id, sucursal_id, cantidad) 
VALUES (4, 1, 500);
INSERT INTO Stock (producto_id, sucursal_id, cantidad) 
VALUES (4, 2, 500);

-- Usuario
INSERT INTO Usuario (nombre, email, contrasena, rut, rol_id, sucursal_id) 
VALUES ('Juan Pérez', 'admin@ferremas.cl', SHA2('Admin123', 256), '12345678-9', 1, 1);

INSERT INTO Usuario (nombre, email, contrasena, rut, rol_id, sucursal_id) 
VALUES ('Andrés Salcedo', 'an.salcedo@duocuc.cl', '$2b$10$0cyy79CrzmH.au6Ejt1o0OBFNiK7uqjmmicuO/N756RkC1Lx8TDV2', '19134035-3', 1, 1); -- contraseña Admin.123456789

-- Verificar tablas creadas
-- SHOW TABLES;
-- drop table USUARIO;
-- Verificar estructura de una tabla
-- DESCRIBE Usuario; -- Pago, DetallePedido, Pedido, Stock, Producto, Categoria, Marca, Usuario, Sucursal, Rol

-- Verificar datos de una tabla
-- Select * from Usuario; -- Pago, DetallePedido, Pedido, Stock, Producto, Categoria, Marca, Usuario, Sucursal, Rol
