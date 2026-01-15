import React, { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, Tag, Search, Plus, Trash2, Edit } from 'lucide-react';

const TransactionAPI = () => {
  const [transactions, setTransactions] = useState([
    { id: 1, amount: 1250.00, type: 'income', category: 'Salary', description: 'Monthly salary', date: '2026-01-15', tags: ['work', 'regular'] },
    { id: 2, amount: 45.50, type: 'expense', category: 'Food', description: 'Grocery shopping', date: '2026-01-14', tags: ['groceries'] },
    { id: 3, amount: 120.00, type: 'expense', category: 'Transport', description: 'Gas station', date: '2026-01-13', tags: ['car', 'fuel'] }
  ]);
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    tags: ''
  });
  
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [apiResponse, setApiResponse] = useState('');

  // API Simulation Functions
  const simulateAPI = (method, endpoint, data = null) => {
    const response = {
      method,
      endpoint,
      timestamp: new Date().toISOString(),
      data,
      status: 200,
      message: 'Success'
    };
    setApiResponse(JSON.stringify(response, null, 2));
    return response;
  };

  // CREATE - POST /transactions
  const handleCreate = (e) => {
    e.preventDefault();
    const newTransaction = {
      id: Math.max(...transactions.map(t => t.id), 0) + 1,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      description: formData.description,
      date: formData.date,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };
    
    setTransactions([...transactions, newTransaction]);
    simulateAPI('POST', '/api/transactions', newTransaction);
    
    setFormData({
      amount: '',
      type: 'expense',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      tags: ''
    });
  };

  // READ - GET /transactions
  const handleGetAll = () => {
    simulateAPI('GET', '/api/transactions', transactions);
  };

  // READ - GET /transactions/:id
  const handleGetOne = (id) => {
    const transaction = transactions.find(t => t.id === id);
    simulateAPI('GET', `/api/transactions/${id}`, transaction);
  };

  // UPDATE - PUT /transactions/:id
  const handleUpdate = (e) => {
    e.preventDefault();
    const updatedTransaction = {
      id: editingId,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      description: formData.description,
      date: formData.date,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };
    
    setTransactions(transactions.map(t => 
      t.id === editingId ? updatedTransaction : t
    ));
    simulateAPI('PUT', `/api/transactions/${editingId}`, updatedTransaction);
    
    setEditingId(null);
    setFormData({
      amount: '',
      type: 'expense',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      tags: ''
    });
  };

  // DELETE - DELETE /transactions/:id
  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
    simulateAPI('DELETE', `/api/transactions/${id}`, { id, deleted: true });
  };

  // Analytics - GET /transactions/analytics
  const getAnalytics = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    const categoryBreakdown = transactions.reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = 0;
      acc[t.category] += t.amount;
      return acc;
    }, {});
    
    const analytics = {
      totalIncome,
      totalExpense,
      balance,
      transactionCount: transactions.length,
      categoryBreakdown
    };
    
    return analytics;
  };

  const handleGetAnalytics = () => {
    const analytics = getAnalytics();
    simulateAPI('GET', '/api/transactions/analytics', analytics);
  };

  const startEdit = (transaction) => {
    setEditingId(transaction.id);
    setFormData({
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      description: transaction.description,
      date: transaction.date,
      tags: transaction.tags.join(', ')
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      amount: '',
      type: 'expense',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      tags: ''
    });
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = filter === 'all' || t.type === filter;
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const analytics = getAnalytics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-10 h-10 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Transaction Management API</h1>
              <p className="text-gray-600">Complete REST API with CRUD operations</p>
            </div>
          </div>

          {/* Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Income</span>
              </div>
              <p className="text-2xl font-bold text-green-800">${analytics.totalIncome.toFixed(2)}</p>
            </div>
            
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-red-600 rotate-180" />
                <span className="text-sm font-semibold text-red-700">Expenses</span>
              </div>
              <p className="text-2xl font-bold text-red-800">${analytics.totalExpense.toFixed(2)}</p>
            </div>
            
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">Balance</span>
              </div>
              <p className="text-2xl font-bold text-blue-800">${analytics.balance.toFixed(2)}</p>
            </div>
            
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-purple-700">Total</span>
              </div>
              <p className="text-2xl font-bold text-purple-800">{analytics.transactionCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingId ? '✏️ Update Transaction' : '➕ Create Transaction'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                    placeholder="food, monthly, urgent"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={editingId ? handleUpdate : handleCreate}
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    {editingId ? 'Update' : 'Create'}
                  </button>
                  {editingId && (
                    <button
                      onClick={cancelEdit}
                      className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* API Response */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">📡 API Response</h2>
              <pre className="text-green-400 text-sm overflow-auto max-h-96 font-mono">
                {apiResponse || 'Perform an action to see the API response...'}
              </pre>
            </div>
          </div>

          {/* Transactions List */}
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('income')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filter === 'income' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Income
                </button>
                <button
                  onClick={() => setFilter('expense')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filter === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Expenses
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredTransactions.map(transaction => (
                <div
                  key={transaction.id}
                  className={`border-2 rounded-xl p-4 transition-all hover:shadow-md ${
                    transaction.type === 'income' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-2xl font-bold ${
                          transaction.type === 'income' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          ${transaction.amount.toFixed(2)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          transaction.type === 'income' 
                            ? 'bg-green-200 text-green-800' 
                            : 'bg-red-200 text-red-800'
                        }`}>
                          {transaction.category}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 font-medium mb-2">{transaction.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {transaction.date}
                        </div>
                        {transaction.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {transaction.tags.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGetOne(transaction.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="GET /transactions/:id"
                      >
                        <Search className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => startEdit(transaction)}
                        className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                        title="PUT /transactions/:id"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="DELETE /transactions/:id"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API Endpoints Reference */}
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📚 API Endpoints</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-white rounded-lg p-3 border border-indigo-200">
                <span className="font-mono text-green-600 font-bold">POST</span> /api/transactions
                <p className="text-gray-600 text-xs mt-1">Create new transaction</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-indigo-200">
                <span className="font-mono text-blue-600 font-bold">GET</span> /api/transactions
                <p className="text-gray-600 text-xs mt-1">Get all transactions</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-indigo-200">
                <span className="font-mono text-blue-600 font-bold">GET</span> /api/transactions/:id
                <p className="text-gray-600 text-xs mt-1">Get single transaction</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-indigo-200">
                <span className="font-mono text-yellow-600 font-bold">PUT</span> /api/transactions/:id
                <p className="text-gray-600 text-xs mt-1">Update transaction</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-indigo-200">
                <span className="font-mono text-red-600 font-bold">DELETE</span> /api/transactions/:id
                <p className="text-gray-600 text-xs mt-1">Delete transaction</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-indigo-200">
                <span className="font-mono text-blue-600 font-bold">GET</span> /api/transactions/analytics
                <p className="text-gray-600 text-xs mt-1">Get analytics data</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionAPI;