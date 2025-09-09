module.exports = {
  ADMIN: 'Administrador',
  VENDEDOR: 'Vendedor',
  BODEGUERO: 'Bodeguero',
  CONTADOR: 'Contador',
  CLIENTE: 'Cliente',
  
  hierarchy: {
    Administrador: 4,
    Contador: 3,
    Vendedor: 2,
    Bodeguero: 1,
    Cliente: 0
  },

  hasPermission: (userRole, requiredRole) => {
    const roles = this.hierarchy;
    return roles[userRole] >= roles[requiredRole];
  }
};