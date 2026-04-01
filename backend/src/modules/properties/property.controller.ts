// backend/src/modules/properties/property.controller.ts
import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to safely get string from query param
const getStringParam = (param: string | string[] | undefined): string | undefined => {
  if (!param) return undefined;
  return Array.isArray(param) ? param[0] : param;
};

// GET ALL (With Full Filters including checkIn/checkOut)
export const getProperties = async (req: Request, res: Response) => {
  try {
    const { 
      location, 
      minPrice, 
      maxPrice, 
      status,
      checkIn,
      checkOut,
      bedrooms,
      homeType,
      amenities,
      limit = '20',
      offset = '0'
    } = req.query;

    // Build where clause
    const where: Prisma.PropertyWhereInput = {
      deletedAt: null,
      approvalStatus: 'approved',
      isAvailable: true,
    };

    // Location filter - safely convert to string
    const locationStr = getStringParam(location);
    if (locationStr && locationStr.trim()) {
      where.location = {
        contains: locationStr.trim(),
        mode: 'insensitive'
      };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.monthlyPrice = {};
      const minPriceNum = getStringParam(minPrice);
      const maxPriceNum = getStringParam(maxPrice);
      if (minPriceNum && Number(minPriceNum) > 0) where.monthlyPrice.gte = Number(minPriceNum);
      if (maxPriceNum && Number(maxPriceNum) > 0) where.monthlyPrice.lte = Number(maxPriceNum);
    }

    // Bedrooms filter
    const bedroomsStr = getStringParam(bedrooms);
    if (bedroomsStr && Number(bedroomsStr) > 0) {
      where.bedrooms = { gte: Number(bedroomsStr) };
    }

    // Date availability filter
    const checkInStr = getStringParam(checkIn);
    const checkOutStr = getStringParam(checkOut);
    if (checkInStr && checkOutStr) {
      const checkInDate = new Date(checkInStr);
      const checkOutDate = new Date(checkOutStr);
      
      where.bookings = {
        none: {
          AND: [
            { status: 'approved' },
            { startDate: { lt: checkOutDate } },
            { endDate: { gt: checkInDate } }
          ]
        }
      };
    }

    console.log('🔍 Searching properties with filters:', JSON.stringify({
      location: locationStr,
      minPrice,
      maxPrice,
      checkIn: checkInStr,
      checkOut: checkOutStr,
      bedrooms: bedroomsStr
    }, null, 2));

    const properties = await prisma.property.findMany({
      where,
      include: {
        owner: { 
          select: { 
            id: true,
            fullName: true, 
            email: true,
            profileImageUrl: true
          } 
        },
        media: {
          where: { mediaType: 'image' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(getStringParam(limit) || '20'),
      skip: Number(getStringParam(offset) || '0')
    });

    const total = await prisma.property.count({ where });

    res.status(200).json({ 
      success: true, 
      count: properties.length,
      total,
      data: properties 
    });
  } catch (error: any) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// SEARCH PROPERTIES
export const searchProperties = async (req: Request, res: Response) => {
  try {
    const { q, location, minPrice, maxPrice, checkIn, checkOut, bedrooms } = req.query;

    const where: any = {
      deletedAt: null,
      approvalStatus: 'approved',
      isAvailable: true,
    };

    // Safely get string params
    const qStr = getStringParam(q);
    const locationStr = getStringParam(location);
    const minPriceStr = getStringParam(minPrice);
    const maxPriceStr = getStringParam(maxPrice);
    const checkInStr = getStringParam(checkIn);
    const checkOutStr = getStringParam(checkOut);
    const bedroomsStr = getStringParam(bedrooms);

    // Text search
    if (qStr && qStr.trim()) {
      where.OR = [
        { title: { contains: qStr, mode: 'insensitive' } },
        { description: { contains: qStr, mode: 'insensitive' } },
        { location: { contains: qStr, mode: 'insensitive' } },
      ];
    }

    // Location filter
    if (locationStr && locationStr.trim()) {
      where.location = { contains: locationStr, mode: 'insensitive' };
    }

    // Price range
    if (minPriceStr || maxPriceStr) {
      where.monthlyPrice = {};
      if (minPriceStr && Number(minPriceStr) > 0) where.monthlyPrice.gte = Number(minPriceStr);
      if (maxPriceStr && Number(maxPriceStr) > 0) where.monthlyPrice.lte = Number(maxPriceStr);
    }

    // Bedrooms
    if (bedroomsStr && Number(bedroomsStr) > 0) {
      where.bedrooms = { gte: Number(bedroomsStr) };
    }

    // Date availability
    if (checkInStr && checkOutStr) {
      const checkInDate = new Date(checkInStr);
      const checkOutDate = new Date(checkOutStr);
      
      where.bookings = {
        none: {
          AND: [
            { status: 'approved' },
            { startDate: { lt: checkOutDate } },
            { endDate: { gt: checkInDate } }
          ]
        }
      };
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        owner: { select: { fullName: true, email: true } },
        media: { take: 5 },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    console.error('Error searching properties:', error);
    res.status(500).json({ message: 'Search failed' });
  }
};

// GET BY ID
export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findFirst({
      where: { id, deletedAt: null },
      include: { 
        owner: { select: { fullName: true, email: true, profileImageUrl: true } },
        media: true,
        amenities: { include: { amenity: true } }
      }
    });

    if (!property) return res.status(404).json({ message: "Property not found" });
    res.status(200).json({ success: true, data: property });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE
export const createProperty = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      description, 
      location, 
      latitude, 
      longitude, 
      monthlyPrice,
      bedrooms,
      bathrooms,
      maxGuests,
      area
    } = req.body;
    
    const ownerId = (req as any).user?.userId;

    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: No owner ID found" });
    }

    const newProperty = await prisma.property.create({
      data: {
        title,
        description,
        location,
        latitude: latitude || 0,
        longitude: longitude || 0,
        monthlyPrice: parseFloat(monthlyPrice),
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseFloat(bathrooms) : null,
        maxGuests: maxGuests ? parseInt(maxGuests) : null,
        area: area ? parseFloat(area) : null,
        ownerId,
        approvalStatus: 'pending',
      },
    });

    res.status(201).json({ success: true, data: newProperty });
  } catch (error: any) {
    console.error('Error creating property:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// UPDATE
export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ownerId = (req as any).user?.userId;

    const updateResult = await prisma.property.updateMany({
      where: { id, ownerId },
      data: req.body,
    });

    if (updateResult.count === 0) {
      return res.status(404).json({ message: "Property not found or unauthorized" });
    }

    res.status(200).json({ success: true, message: "Property updated successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE (Soft Delete)
export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ownerId = (req as any).user?.userId;

    const deleteResult = await prisma.property.updateMany({
      where: { id, ownerId },
      data: { deletedAt: new Date() },
    });

    if (deleteResult.count === 0) {
      return res.status(404).json({ message: "Property not found or unauthorized" });
    }

    res.status(200).json({ success: true, message: "Property deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET PROPERTIES BY LOCATION
export const getPropertiesByLocation = async (req: Request, res: Response) => {
  try {
    const { location } = req.params;
    
    const properties = await prisma.property.findMany({
      where: {
        location: {
          contains: location,
          mode: 'insensitive'
        },
        deletedAt: null,
        approvalStatus: 'approved'
      },
      include: {
        media: true,
        owner: {
          select: { fullName: true }
        }
      },
      take: 20
    });

    res.status(200).json({ success: true, data: properties });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPLOAD IMAGES
export const uploadPropertyImages = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const files = req.files as any[];

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: "No image files provided" });
    }

    const mediaEntries = await Promise.all(
      files.map((file) =>
        prisma.propertyMedia.create({
          data: {
            propertyId,
            mediaUrl: file.path,
            mediaType: "image",
          },
        })
      )
    );

    res.status(201).json({
      success: true,
      message: `${mediaEntries.length} images uploaded successfully`,
      data: mediaEntries,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};