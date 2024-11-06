class ApiClient {
    constructor(baseUrl) {
      this.baseUrl = baseUrl;
    }
  
    // Método para obtener todos los items (READ)
    async getItems() {
      try {
        const response = await fetch(`${this.baseUrl}/items`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
  
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error al obtener los items:', error);
      }
    }
  
    // Método para crear un nuevo item (CREATE)
    async createItem(item) {
      try {
        const response = await fetch(`${this.baseUrl}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        });
  
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
  
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error al crear el item:', error);
      }
    }
  
    // Método para actualizar un item (UPDATE)
    async updateItem(id, item) {
      try {
        const response = await fetch(`${this.baseUrl}/items/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        });
  
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
  
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error al actualizar el item:', error);
      }
    }
  
    // Método para eliminar un item (DELETE)
    async deleteItem(id) {
      try {
        const response = await fetch(`${this.baseUrl}/items/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
  
        return true;
      } catch (error) {
        console.error('Error al eliminar el item:', error);
      }
    }
  }
  