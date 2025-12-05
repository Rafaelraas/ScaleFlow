"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AdminCompanyManagement = () => {
  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Company Management</CardTitle>
          <CardDescription>
            As a System Administrator, manage all companies within the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This page will allow you to view, create, edit, and delete companies.
          </p>
          <Button asChild>
            <Link to="/admin/companies/create">Create New Company</Link>
          </Button>
          {/* Future: Table of companies, edit/delete actions */}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCompanyManagement;