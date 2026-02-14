import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState([]);
  const { token, logout } = useAuth();

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    if (!token) return;
    try {
      const data = await api.getExpenses(token);
      setExpenses(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los gastos');
    }
  };

  const handleDelete = async (expenseId: string) => {
    if (!token) return;
    try {
      await api.deleteExpense(token, expenseId);
      loadExpenses();
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el gasto');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Gastos</Text>
      <FlatList
        data={expenses}
        keyExtractor={(item: any) => item.ExpenseId}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.description}</Text>
            <Text>${item.amount}</Text>
            <Button title="Eliminar" onPress={() => handleDelete(item.ExpenseId)} />
          </View>
        )}
      />
      <Button title="Cerrar Sesión" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  item: { padding: 15, borderBottomWidth: 1, borderColor: '#ccc' },
});

