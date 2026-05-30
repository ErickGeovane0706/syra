package com.syra.service;


import com.cloudinary.Cloudinary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class FileUploadService {

    private final Cloudinary cloudinary;

    public FileUploadService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public Map<String, Object> upload(MultipartFile file) throws IOException {
        return cloudinary.uploader().upload(file.getBytes(),
                Map.of("folder", "syra/produtos"));
    }
}