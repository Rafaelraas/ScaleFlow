"use client";

import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AdminUserManagement = () => {
  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Global User Management</CardTitle>
          <CardDescription>
            As a System Administrator, manage all user profiles across all companies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This page will allow you to view, edit roles, and assign/unassign users to companies.
          </p>
          <Button asChild>
            <Link to="/admin/users/invite">Invite New User Globally</Link>
          </Button>
          {/* Future: Table of all users, edit/delete actions, company assignment */}
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default AdminUserManagement;