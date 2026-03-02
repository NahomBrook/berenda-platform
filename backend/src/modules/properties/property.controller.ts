import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// CREATE
export const createProperty = async (req: Request, res: Response) => {
  try {
    const { title, description, location, latitude, longitude, monthlyPrice } = req.body;
    const ownerId = (req as any).user?.userId;

    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: No owner ID found" });
    }

    const newProperty = await prisma.property.create({
      data: {
        title,
        description,
        location,
        latitude,
        longitude,
        monthlyPrice,
        ownerId,
      },
    });

    res.status(201).json({ success: true, data: newProperty });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET ALL (With Filters)
export const getProperties = async (req: Request, res: Response) => {
  try {
    const { location, minPrice, maxPrice, status } = req.query;

    const properties = await prisma.property.findMany({
      where: {
        deletedAt: null,
        ...(location && {
          location: { contains: String(location), mode: 'insensitive' },
        }),
        ...((minPrice || maxPrice) && {
          monthlyPrice: {
            ...(minPrice && { gte: Number(minPrice) }),
            ...(maxPrice && { lte: Number(maxPrice) }),
          },
        }),
        ...(status && {
          approvalStatus: status as any,
        }),
      },
      include: {
        owner: { select: { fullName: true, email: true } },
        media: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET BY ID
export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findFirst({
      where: { id, deletedAt: null },
      include: { 
        owner: { select: { fullName: true, email: true } },
        media: true // Added so you can see images on the details page
      }
    });

    if (!property) return res.status(404).json({ message: "Property not found" });
    res.status(200).json({ success: true, data: property });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE (Only by owner)
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

// MULTIPLE IMAGE UPLOAD
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