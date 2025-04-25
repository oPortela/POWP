class OrderManager {
    constructor() {
      this.currentOrder = {
        number: this.generateOrderNumber(),
        date: new Date().toISOString().split('T')[0],
        customer: {
          code: '',
          name: '',
          document: ''
        },
        seller: '',
        freight: 'por_conta',
        carrier: '',
        freightValue: 0,
        insuranceValue: 0,
        items: [],
        observations: '',
        payment: {
          method: '58',
          term: '102',
          installments: []
        }
      };
    }
  
    generateOrderNumber() {
      return Math.floor(100000 + Math.random() * 900000);
    }
  
    addItem(product, quantity) {
      const discount = this.calculateDiscount(product.price * quantity);
      
      this.currentOrder.items.push({
        product,
        quantity,
        unitPrice: product.price,
        discountPercent: discount.percent,
        discountValue: discount.value,
        total: (product.price * quantity) - discount.value
      });
  
      this.updateTotals();
      this.updateInstallments();
    }
  
    removeItem(index) {
      this.currentOrder.items.splice(index, 1);
      this.updateTotals();
      this.updateInstallments();
    }
  
    calculateDiscount(value) {
      // Sample discount logic - could be more complex in real application
      const percent = value > 2000 ? 2.3 : 1.4;
      return {
        percent,
        value: (value * percent) / 100
      };
    }
  
    updateTotals() {
      const subtotal = this.currentOrder.items.reduce((sum, item) => 
        sum + (item.product.price * item.quantity), 0);
      
      const discount = this.currentOrder.items.reduce((sum, item) => 
        sum + item.discountValue, 0);
      
      const freightInsurance = 
        parseFloat(this.currentOrder.freightValue) + 
        parseFloat(this.currentOrder.insuranceValue);
  
      this.currentOrder.totals = {
        subtotal,
        discount,
        freightInsurance,
        total: subtotal - discount + freightInsurance
      };
    }
  
    updateInstallments() {
      const total = this.currentOrder.totals.total;
      const installments = [];
      
      // Sample installment calculation for "102 - 7/14/21/28 dias"
      if (this.currentOrder.payment.term === '102') {
        const installmentValue = (total / 4).toFixed(2);
        const today = new Date();
        
        [7, 14, 21, 28].forEach((days, index) => {
          const date = new Date(today);
          date.setDate(date.getDate() + days);
          
          installments.push({
            number: index + 1,
            date: date.toISOString().split('T')[0],
            value: installmentValue
          });
        });
      }
      
      this.currentOrder.payment.installments = installments;
    }
  
    setCustomer(code, name, document) {
      this.currentOrder.customer = { code, name, document };
    }
  
    setSeller(seller) {
      this.currentOrder.seller = seller;
    }
  
    setFreight(type, value) {
      this.currentOrder.freight = type;
      this.currentOrder.freightValue = parseFloat(value);
      this.updateTotals();
    }
  
    setCarrier(carrier) {
      this.currentOrder.carrier = carrier;
    }
  
    setInsurance(value) {
      this.currentOrder.insuranceValue = parseFloat(value);
      this.updateTotals();
    }
  
    setPaymentMethod(method) {
      this.currentOrder.payment.method = method;
      this.updateInstallments();
    }
  
    setPaymentTerm(term) {
      this.currentOrder.payment.term = term;
      this.updateInstallments();
    }
  
    setObservations(text) {
      this.currentOrder.observations = text;
    }
  
    validateOrder() {
      const errors = [];
  
      if (!this.currentOrder.customer.code || !this.currentOrder.customer.name) {
        errors.push('Dados do cliente são obrigatórios');
      }
  
      if (!this.currentOrder.seller) {
        errors.push('Selecione um vendedor');
      }
  
      if (this.currentOrder.items.length === 0) {
        errors.push('Adicione pelo menos um item ao pedido');
      }
  
      return errors;
    }
  
    saveOrder() {
      const errors = this.validateOrder();
      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }
  
      // Here you would typically send the order to a backend server
      console.log('Saving order:', this.currentOrder);
      return true;
    }
  }
  
  const orderManager = new OrderManager();