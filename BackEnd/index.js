import { CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import jwt from 'jsonwebtoken';

const cognitoClient = new CognitoIdentityProviderClient({ region: 'us-east-2' });
const dynamoClient = new DynamoDBClient({ region: 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event)); // Debug
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const { httpMethod } = event;
  // Usar requestContext.path que incluye el stage, o path si no existe
  const fullPath = event.requestContext?.path || event.path;
  const actualPath = fullPath.replace('/ApiRestGastos', ''); // Remover stage del path
  
  try {
    // Rutas públicas (sin autenticación)
    if (actualPath === '/login' && httpMethod === 'POST') {
      return await handleLogin(event);
    }
    
    if (actualPath === '/register' && httpMethod === 'POST') {
      return await handleRegister(event);
    }
    
    if (actualPath === '/verify' && httpMethod === 'POST') {
      return await handleVerify(event);
    }
    
    if (actualPath === '/config' && httpMethod === 'GET') {
      return await handleConfig(event);
    }

    // Verificar token para rutas protegidas
    const userId = await verifyToken(event);
    if (!userId) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Token inválido' }) };
    }

    // Rutas de usuarios
    if (actualPath === '/users' && httpMethod === 'GET') {
      return await getUser(userId);
    }
    
    if (actualPath === '/users' && httpMethod === 'POST') {
      return await createUser(event, userId);
    }

    // Rutas de gastos
    if (actualPath === '/expenses' && httpMethod === 'GET') {
      return await getExpenses(userId, event.queryStringParameters);
    }
    
    if (actualPath === '/expenses' && httpMethod === 'POST') {
      return await createExpense(event, userId);
    }
    
    if (actualPath === '/expenses' && httpMethod === 'PUT') {
      return await updateExpense(event, userId);
    }
    
    if (actualPath === '/expenses' && httpMethod === 'DELETE') {
      return await deleteExpense(event, userId);
    }
    
    if (actualPath === '/expenses/reports' && httpMethod === 'GET') {
      return await getReports(userId, event.queryStringParameters);
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Ruta no encontrada', path: actualPath }) };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Función de login con Cognito
async function handleLogin(event) {
  const { username, password } = JSON.parse(event.body);
  
  try {
    const authParams = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      }
    };

    const command = new InitiateAuthCommand(authParams);
    const result = await cognitoClient.send(command);
    
    const token = jwt.sign(
      { 
        sub: result.AuthenticationResult.AccessToken,
        username: username 
      },
      'your-jwt-secret',
      { expiresIn: '24h' }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        token: token,
        accessToken: result.AuthenticationResult.AccessToken
      })
    };
  } catch (error) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: error.message || 'Credenciales inválidas' 
      })
    };
  }
}

async function handleRegister(event) {
  const { username, email, password } = JSON.parse(event.body);
  
  try {
    // 1. Registrar en Cognito
    const signUpCommand = new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: username }
      ]
    });
    
    await cognitoClient.send(signUpCommand);
    
    // 2. Crear usuario en DynamoDB
    const userId = Date.now().toString();
    const command = new PutCommand({
      TableName: 'Users',
      Item: {
        userId: userId,
        username,
        email,
        createdAt: new Date().toISOString()
      }
    });
    
    await docClient.send(command);
    
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Usuario registrado exitosamente. Verifica tu email.',
        userId
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message
      })
    };
  }
}

async function handleVerify(event) {
  const { email, code } = JSON.parse(event.body);
  
  console.log('Verifying:', { email, code });
  
  try {
    const confirmCommand = new ConfirmSignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code
    });
    
    await cognitoClient.send(confirmCommand);
    
    console.log('Verification successful');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Email verificado exitosamente'
      })
    };
  } catch (error) {
    console.error('Verification error:', error);
    
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message
      })
    };
  }
}

async function handleConfig(event) {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      cognitoClientId: process.env.COGNITO_CLIENT_ID,
      apiEndpoint: process.env.API_ENDPOINT
    })
  };
}

async function verifyToken(event) {
  const authHeader = event.headers.Authorization || event.headers.authorization;
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, 'your-jwt-secret');
    return decoded.username;
  } catch {
    return null;
  }
}

// CRUD Usuarios
async function getUser(userId) {
  const command = new GetCommand({
    TableName: 'Users',
    Key: { userId: userId }
  });
  
  const result = await docClient.send(command);
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result.Item || {})
  };
}

async function createUser(event, userId) {
  const userData = JSON.parse(event.body);
  
  const command = new PutCommand({
    TableName: 'Users',
    Item: {
      userId: userId,
      ...userData,
      createdAt: new Date().toISOString()
    }
  });
  
  await docClient.send(command);
  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({ message: 'Usuario creado' })
  };
}

// CRUD Gastos
async function getExpenses(userId, queryParams) {
  const command = new QueryCommand({
    TableName: 'Expenses',
    KeyConditionExpression: 'UserId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  });
  
  const result = await docClient.send(command);
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result.Items || [])
  };
}

async function createExpense(event, userId) {
  const expenseData = JSON.parse(event.body);
  const expenseId = Date.now().toString();
  
  const command = new PutCommand({
    TableName: 'Expenses',
    Item: {
      UserId: userId,
      ExpenseId: expenseId,
      ...expenseData,
      createdAt: new Date().toISOString()
    }
  });
  
  await docClient.send(command);
  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({ message: 'Gasto creado', expenseId })
  };
}

async function updateExpense(event, userId) {
  const { expenseId, ...updateData } = JSON.parse(event.body);
  
  const command = new UpdateCommand({
    TableName: 'Expenses',
    Key: { UserId: userId, ExpenseId: expenseId },
    UpdateExpression: 'SET #amount = :amount, #description = :description, #category = :category',
    ExpressionAttributeNames: {
      '#amount': 'amount',
      '#description': 'description',
      '#category': 'category'
    },
    ExpressionAttributeValues: {
      ':amount': updateData.amount,
      ':description': updateData.description,
      ':category': updateData.category
    }
  });
  
  await docClient.send(command);
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'Gasto actualizado' })
  };
}

async function deleteExpense(event, userId) {
  const { expenseId } = JSON.parse(event.body);
  
  const command = new DeleteCommand({
    TableName: 'Expenses',
    Key: { UserId: userId, ExpenseId: expenseId }
  });
  
  await docClient.send(command);
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'Gasto eliminado' })
  };
}

async function getReports(userId, queryParams) {
  const { period = 'monthly' } = queryParams || {};
  
  const command = new QueryCommand({
    TableName: 'Expenses',
    KeyConditionExpression: 'UserId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  });
  
  const result = await docClient.send(command);
  const expenses = result.Items || [];
  
  // Calcular totales por período
  const total = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      period,
      total,
      count: expenses.length,
      expenses
    })
  };
}