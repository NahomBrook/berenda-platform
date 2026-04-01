import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || "superlongrandomaccesssecret";
const JWT_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "15m";

export const registerUser = async (
  email: string,
  password: string,
  roleName: string = "USER",
  fullName?: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Get the role from database
  const role = await prisma.role.findUnique({
    where: { name: roleName }
  });
  
  if (!role) {
    throw new Error(`Role "${roleName}" not found. Please run seed first.`);
  }
  
  // Generate unique username
  const usernameBase = email.split('@')[0];
  let username = usernameBase;
  let suffix = 1;
  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${usernameBase}${suffix++}`;
  }
  
  // Create user with role
  const user = await prisma.user.create({
    data: { 
      email, 
      passwordHash: hashedPassword, 
      fullName: fullName || username,
      username,
      isVerified: true,
      roles: {
        create: {
          roleId: role.id
        }
      }
    },
    include: {
      roles: {
        include: {
          role: true
        }
      }
    }
  });
  
  return user;
};

export const loginUser = async (email: string, password: string) => {
  // Find user with roles
  const user = await prisma.user.findUnique({ 
    where: { email },
    include: {
      roles: {
        include: {
          role: true
        }
      }
    }
  });
  
  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // Get role names for token
  const roleNames = user.roles.map(r => r.role.name);
  
  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      roles: roleNames,
      isAdmin: roleNames.includes("ADMIN") || roleNames.includes("SUPER_ADMIN")
    }, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRES }
  );

  return { user, token };
};

export const loginWithGoogle = async (idToken: string) => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!res.ok) throw new Error("Invalid Google ID token");
  const payload = await res.json();

  // Validate audience
  if (GOOGLE_CLIENT_ID && payload.aud !== GOOGLE_CLIENT_ID) {
    throw new Error("Google ID token audience mismatch");
  }

  const email: string = payload.email;
  const fullName: string = payload.name || "";
  const picture: string | undefined = payload.picture;

  if (!email) throw new Error("Google token did not contain email");

  // Find or create user
  let user = await prisma.user.findUnique({ 
    where: { email },
    include: {
      roles: {
        include: {
          role: true
        }
      }
    }
  });
  
  if (!user) {
    // Get USER role
    const userRole = await prisma.role.findUnique({
      where: { name: "USER" }
    });
    
    if (!userRole) {
      throw new Error("USER role not found. Please run seed first.");
    }
    
    // Create user with random password
    const randomPass = Math.random().toString(36).slice(-12);
    const hashed = await bcrypt.hash(randomPass, 10);
    const usernameBase = email.split("@")[0];
    let username = usernameBase;
    let suffix = 1;
    
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${usernameBase}${suffix++}`;
    }

    user = await prisma.user.create({
      data: {
        email,
        fullName: fullName || email.split("@")[0],
        username,
        passwordHash: hashed,
        profileImageUrl: picture,
        isVerified: true,
        roles: {
          create: {
            roleId: userRole.id
          }
        }
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
  }
  
  // Get role names for token
  const roleNames = user.roles.map(r => r.role.name);
  
  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      roles: roleNames,
      isAdmin: roleNames.includes("ADMIN") || roleNames.includes("SUPER_ADMIN")
    }, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRES }
  );
  
  return { user, token };
};
