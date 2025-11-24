import React from "react";

export const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white border-b shadow-sm p-4">
				<div className="container mx-auto">
					<h2 className="text-lg font-medium">Admin</h2>
				</div>
			</header>
			<main className="container mx-auto p-4">{children}</main>
		</div>
	);
};

export default AdminLayout;
