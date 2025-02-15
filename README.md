# Aplicación del Principio de Responsabilidad Única (SRP) en `UserService`

## 📌 Elección del Código

El código seleccionado para aplicar el **Principio de Responsabilidad Única (SRP)** corresponde a la clase `UserService`. Inicialmente, esta clase tenía múltiples responsabilidades, lo que dificultaba su mantenimiento y prueba. 

### 🔴 Problema Inicial:
- `UserService` manejaba la validación de datos de usuario.
- Se encargaba del hashing y comparación de contraseñas.
- Interactuaba directamente con la base de datos.
- Contenía lógica de negocio, validación y persistencia en una sola clase.

![alt text](<images\CodeNotGood(SRP).png>)

Para solucionar esto, se aplicó el SRP, separando cada una de estas responsabilidades en clases independientes.

---

## ✅ Mejoras Implementadas

### 📌 Separación de Validación (`UserValidator`)
- **Antes**: `UserService` verificaba que los datos ingresados fueran correctos.
- **Ahora**: Se creó `UserValidator`, que encapsula la validación de datos y la verificación de existencia de usuarios.

### 📌 Manejo de Contraseñas (`PasswordService`)
- **Antes**: `UserService` se encargaba de encriptar y comparar contraseñas.
- **Ahora**: Se trasladó esta responsabilidad a `PasswordService`, mejorando la seguridad y el cumplimiento de SRP.

### 📌 Creación de Usuarios (`UserFactory`)
- **Antes**: `UserService` construía manualmente el objeto del usuario.
- **Ahora**: `UserFactory` encapsula la creación de usuarios, asegurando mayor modularidad.

### 📌 Interacción con la Base de Datos (`UserRepository`)
- **Antes**: `UserService` interactuaba directamente con la base de datos.
- **Ahora**: `UserRepository` maneja toda la lógica de persistencia.

### 📌 Refactorización de `UserService`
- `registerUser` solo **orquesta** el registro, delegando validación, creación y almacenamiento.
- `authenticateUser` delega la verificación de credenciales a `PasswordService`.
- Se creó `findUserByEmail` para buscar usuarios y lanzar errores si no existen.

![alt text](images/CodeGood(SRP).png)

---

## 🎯 Beneficios de la Refactorización

✔ **Mayor cohesión**: Cada clase tiene una única responsabilidad.  
✔ **Menor acoplamiento**: `UserService` no depende directamente de validación, seguridad o persistencia.  
✔ **Código más mantenible**: Cambios en validación o hashing de contraseñas no afectan a `UserService`.  
✔ **Facilidad para pruebas unitarias**: Se pueden testear cada clase de forma independiente.  

Con estos cambios, `UserService` ahora sigue el **Principio de Responsabilidad Única (SRP)**, mejorando la escalabilidad y mantenibilidad del código. 🚀

---
---

# Aplicación del Principio SOLID de Open/Closed en el Servicio de Puntuaciones  

## Elección del Código  
El código original que maneja la creación de puntuaciones en la API presentaba una estructura rígida que dificultaba su extensión sin modificar la lógica existente. En particular, la clase `ScoreService` tenía una implementación estática en `createScore`, lo que limitaba su flexibilidad. Además, no permitía modificar la lógica de cálculo de puntuaciones sin cambiar directamente el método.  

Para aplicar el **principio de Abierto/Cerrado (OCP)**, se necesitaba un diseño que permitiera la extensión del comportamiento sin alterar el código fuente del servicio.  

![alt text](images/CodeNotGood(OCP).png)

## Mejoras Realizadas  
Para lograr que `ScoreService` siga el principio OCP, se realizaron los siguientes cambios:  

1. **Introducción de una estrategia de puntuación (`ScoreStrategy`)**  
   - Se creó una clase base `ScoreStrategy` con el método `calculateScore`, que actúa como una interfaz para diferentes estrategias de cálculo.  
   - Ahora es posible agregar nuevas estrategias sin modificar `ScoreService`, simplemente creando nuevas implementaciones de `ScoreStrategy`.  

2. **Inyección de Dependencias en `ScoreService`**  
   - Se eliminó la implementación estática y se convirtió en una clase con una estrategia inyectada, permitiendo mayor flexibilidad.  
   - Se introdujo un mecanismo para cambiar la estrategia (`setScoreStrategy`).  

3. **Separación de Responsabilidades**  
   - `ScoreService` ya no es responsable de definir cómo se calcula el puntaje, solo delega esta responsabilidad a la estrategia correspondiente.  

### Código Mejorado  

#### `ScoreService.js` (Nueva Implementación)  

```javascript
import { ScoreRepository } from "../../data/repositories/scoreRepository.js";
import { ScoreValidator } from "../validators/scoreValidator.js";
import { StandardScoreStrategy } from "./strategies/StandardScoreStrategy.js";

export class ScoreService {
    constructor(scoreStrategy = new StandardScoreStrategy()) {
        this.scoreStrategy = scoreStrategy;
    }

    async createScore(playerId, gameId, score) {
        ScoreValidator.validateScoreData(playerId, gameId, score);
        const finalScore = this.scoreStrategy.calculateScore(score);
        return await ScoreRepository.create({ playerId, gameId, score: finalScore });
    }

    setScoreStrategy(strategy) {
        this.scoreStrategy = strategy;
    }
}
```

---
---

# Aplicación del Principio de Sustitución de Liskov (LSP) en la Autenticación

## Elección del Código
Para aplicar el principio de Sustitución de Liskov (LSP) en mi proyecto, elegí el código relacionado con el sistema de autenticación, específicamente las funciones `login` y `logout`.

Esta elección se basó en los siguientes puntos:
1. **El código dependía de implementaciones concretas**: `login` y `logout` estaban directamente acopladas a `jsonwebtoken` y `UserService`, lo que dificultaba cambiar el mecanismo de autenticación sin modificar el código existente.
2. **No existía una abstracción para diferentes estrategias de autenticación**: Si se quisiera implementar otro tipo de autenticación (por ejemplo, OAuth), se tendría que modificar la lógica existente en lugar de simplemente sustituir la estrategia.
3. **El manejo de la lista negra de tokens estaba desacoplado y basado en un `Set`**: No se podía intercambiar por otro almacenamiento sin modificar directamente la función `logout`.

## Mejoras Realizadas
Para adaptar el código al principio de Sustitución de Liskov (LSP), se implementaron las siguientes mejoras:


### 1. Creación de una Clase Base para la Estrategia de Autenticación
Se creó una clase abstracta `AuthStrategy` que define el método `authenticate(user)`. Esto permite que cualquier estrategia de autenticación (JWT, OAuth, etc.) pueda ser utilizada sin modificar la lógica del `AuthService`.

```javascript
export class AuthStrategy {
  authenticate(user) {
    throw new Error("El método 'authenticate' debe ser implementado");
  }
}
```

### 2. Implementación de Estrategias de Autenticación
Se crearon clases que heredan de `AuthStrategy`, permitiendo intercambiar estrategias sin modificar `AuthService`.

```javascript
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AuthStrategy } from "./AuthStrategy.js";

dotenv.config();
const KEY = process.env.SECRET_KEY;

export class JwtStrategy extends AuthStrategy {
  authenticate(user) {
    return jwt.sign({ id: user.id, email: user.email }, KEY, { expiresIn: "1h" });
  }
}
```

```javascript
import { AuthStrategy } from "./AuthStrategy.js";

export class OAuthStrategy extends AuthStrategy {
  authenticate(user) {
    return `OAuthTokenFor-${user.email}`;
  }
}
```

### 3. Creación de un Servicio de Autenticación Generalizado
Se implementó `AuthService`, que recibe una estrategia de autenticación y un servicio de lista negra de tokens, permitiendo intercambiar ambas sin afectar la lógica del login y logout.

```javascript
export class AuthService {
  constructor(authStrategy, blacklistService) {
    if (!authStrategy || !blacklistService) {
      throw new Error("Se requieren authStrategy y blacklistService");
    }
    this.authStrategy = authStrategy;
    this.blacklistService = blacklistService;
  }

  async authenticate({ email, password }) {
    validateCredentials({ email, password });
    const user = await UserService.authenticateUser({ email, password });
    if (!user) {
      throw new NotFoundError("Credenciales inválidas");
    }
    return { message: "Inicio de sesión exitoso", token: this.authStrategy.authenticate(user) };
  }

  logout(token) {
    try {
      jwt.verify(token, process.env.SECRET_KEY);
      this.blacklistService.add(token);
      return { message: "Cierre de sesión exitoso" };
    } catch (error) {
      throw new ValidationError("Token no válido");
    }
  }
}
```

### 4. Implementación de un Servicio para la Lista Negra de Tokens
En lugar de utilizar un `Set` en el controlador, se creó una clase `TokenBlacklistService`, que permite modificar la forma de gestionar la lista negra sin afectar la lógica de `AuthService`.

```javascript
export class TokenBlacklistService {
  constructor() {
    this.blacklist = new Set();
  }

  add(token) {
    this.blacklist.add(token);
  }

  isBlacklisted(token) {
    return this.blacklist.has(token);
  }
}
```

### 5. Modificación del Controlador
Se refactorizó el controlador para utilizar el servicio de autenticación y la lista negra sin preocuparse por la estrategia interna.

```javascript
import { AuthService } from "../../business/services/auth/authService.js";
import { JwtStrategy } from "../../business/services/auth/JwtStrategy.js";
import { TokenBlacklistService } from "../../business/services/tokenBlacklistService.js";

const tokenBlacklistService = new TokenBlacklistService();
const authService = new AuthService(new JwtStrategy(), tokenBlacklistService);

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.authenticate({ email, password });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      throw new ValidationError("Token no proporcionado");
    }
    const result = authService.logout(token);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
```

## Beneficios de las Mejoras
1. **Cumplimiento del Principio de Sustitución de Liskov (LSP)**: Ahora, cualquier estrategia de autenticación puede ser utilizada sin modificar `AuthService`, permitiendo agregar nuevas estrategias sin alterar el código existente.
2. **Desacoplamiento y Mantenibilidad**: El código está mejor organizado, y los cambios en la autenticación o el manejo de tokens no afectan a otras partes del sistema.
3. **Mayor Flexibilidad**: Se pueden agregar futuras mejoras como autenticación multifactor sin afectar la arquitectura.

Con estas mejoras, el código ahora sigue el principio SOLID de Sustitución de Liskov y es más adaptable a cambios futuros. 🚀

---
---

# Aplicación del Principio de Segregación de la Interfaz (ISP) en el Servicio de Cartas  

## **Justificación de la Elección del Código**  

Para aplicar el **Principio de Segregación de la Interfaz (ISP)**, seleccioné la clase `CardService` porque originalmente centralizaba múltiples responsabilidades en una única interfaz de servicio. Esto hacía que cualquier cliente que necesitara solo una funcionalidad tuviera que depender de métodos que no usaba, violando el ISP.  

El código incluía métodos para:  
- Crear cartas (`createCard`)  
- Obtener todas las cartas (`getAllCards`)  
- Obtener una carta por ID (`getCardById`)  
- Obtener la carta superior del descarte (`getTopDiscardCard`)  
- Actualizar una carta (`updateCard`)  

![alt text](images/CodeNotGood(ISP).png)

Dado que cada uno de estos métodos tiene propósitos distintos, decidí dividirlos en **servicios especializados**, evitando que los clientes dependieran de métodos innecesarios.  

---

## **Mejoras Implementadas**  

### **1. Creación de Servicios Específicos**  
Reemplacé la clase `CardService` por varias clases especializadas, siguiendo la idea de que cada interfaz debe ser pequeña y enfocada en una única responsabilidad. Ahora, el código se organiza en las siguientes clases:  

- **`CardCreationService`** → Maneja la creación de cartas.  
- **`CardRetrievalService`** → Encargado de recuperar cartas, ya sea por ID o todas.  
- **`CardGameService`** → Gestiona operaciones específicas del juego, como obtener la carta superior del descarte.  
- **`CardUpdateService`** → Responsable de actualizar cartas.  
- **`CardDeletionService`** → Maneja la eliminación de cartas.  

### **2. Beneficios de la Segregación**  
- **Clientes más específicos:** Ahora, cada cliente de estos servicios (como los controladores) solo importa lo que realmente necesita.  
- **Mantenibilidad:** Al modificar una funcionalidad, no se afecta todo el servicio general.  
- **Facilidad de pruebas:** Cada servicio tiene una responsabilidad clara, lo que simplifica las pruebas unitarias.  
- **Escalabilidad:** Si en el futuro se agregan más funcionalidades, se pueden crear nuevos servicios sin afectar los existentes.  

---
---

# Aplicación del Principio de Inversión de Dependencias (DIP) en UserService

## Razón de la Elección del Código

El código original de `UserService` no cumplía con el principio de **Inversión de Dependencias (DIP)** porque tenía una dependencia directa de `Player`, que es un modelo de datos basado en Mongoose. Esto generaba varios problemas:

1. **Acoplamiento Fuerte:** `UserService` estaba atado a una implementación específica de la persistencia (`Player`), lo que hacía difícil cambiar la base de datos sin modificar la lógica de negocio.
2. **Dificultad en las Pruebas:** Para testear `UserService`, era necesario un entorno de base de datos real o mocks complejos, dificultando las pruebas unitarias.
3. **Escalabilidad Limitada:** Si en el futuro se requiere cambiar la fuente de datos (por ejemplo, de MongoDB a PostgreSQL), sería necesario modificar `UserService`, lo que viola el DIP.

![alt text](images/CodeNotGood(DIP).png)

## Mejoras Realizadas

Para aplicar el principio de **Inversión de Dependencias (DIP)**, se realizaron las siguientes mejoras:

1. **Inyección de Dependencias:** En lugar de depender directamente del modelo `Player`, `UserService` ahora recibe una abstracción (`userRepository`) en su constructor, lo que permite desacoplar la lógica de negocio de la persistencia.
2. **Uso de una Interfaz (Contratos Implícitos en JavaScript):** Se introdujo `userRepository`, que puede tener diferentes implementaciones (MongoDB, SQL, almacenamiento en memoria, etc.), respetando el DIP.
3. **Separación de Responsabilidades:** Se delegó la validación de usuarios a `userValidator`, la gestión de contraseñas a `passwordService` y la creación de objetos a `userFactory`, cumpliendo así con otros principios SOLID como el **SRP (Principio de Responsabilidad Única)**.

### Código Mejorado

```javascript
import { NotFoundError, ValidationError } from "../../utils/customErrors.js";

class UserService {
  constructor(userRepository, userValidator, passwordService, userFactory) {
    this.userRepository = userRepository;
    this.userValidator = userValidator;
    this.passwordService = passwordService;
    this.userFactory = userFactory;
  }

  async registerUser(userData) {
    this.userValidator.validateRegistration(userData);
    await this.userValidator.ensureUserDoesNotExist(userData.email, userData.name);

    const newUserData = await this.userFactory.createUser(userData);
    const newUser = await this.userRepository.createUser(newUserData);

    return { message: "User registered successfully", user: newUser };
  }

  async authenticateUser({ email, password }) {
    const user = await this.findUserByEmail(email);
    await this.passwordService.verify(password, user.password);
    return user;
  }

  async findUserByEmail(email) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async getUserById(id) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }

  async getAllUsers() {
    const users = await this.userRepository.findAll();
    if (!users || users.length === 0) throw new NotFoundError("No players found");
    return users;
  }

  async updateUser(id, updates) {
    if (!updates || Object.keys(updates).length === 0) {
      throw new ValidationError("You must provide at least one field to update");
    }

    const updatedUser = await this.userRepository.updateById(id, updates);
    if (!updatedUser) throw new NotFoundError("Player not found");

    return { message: "Player successfully updated", updatedUser };
  }

  async deleteUser(id) {
    const deletedUser = await this.userRepository.deleteById(id);
    if (!deletedUser) throw new NotFoundError("Player not found");

    return { message: "Player successfully eliminated", deletedUser };
  }
}

export default UserService;
```