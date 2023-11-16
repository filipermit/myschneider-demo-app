import Head from "next/head";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { permitState } from "permit-fe-sdk";
import { useUser } from "@clerk/nextjs";
import React, { useContext } from "react";
import { AbilityContext } from "../utils/AbilityLoader";

const mockSupportCases = [
	{
		id: 1,
		title: "Issue with Product X",
		status: "Open",
		createdDate: "2023-01-10",
		lastUpdated: "2023-01-15",
	},
	{
		id: 2,
		title: "Cannot access account",
		status: "Closed",
		createdDate: "2023-02-05",
		lastUpdated: "2023-02-07",
	},
	{
		id: 3,
		title: "Billing discrepancy",
		status: "In Progress",
		createdDate: "2023-03-12",
		lastUpdated: "2023-03-15",
	},
	// ...more cases
];

const Navbar = () => (
	<nav className="flex justify-between p-4 bg-white fixed w-full top-0">
		<div className="flex items-center space-x-2">
			<Image
				src="/SE-logo.png"
				alt="mySchneider Logo"
				height={100}
				width={100}
			/>
		</div>
		<div className="flex items-center justify-center">
			<UserButton afterSignOutUrl="/" />
		</div>
	</nav>
);

const HomePage = () => {
	const { isSignedIn, user, isLoaded } = useUser();

	const ability = useContext(AbilityContext);

	return (
		<div className="bg-gray-200">
			<Head>
				<title>mySchneider</title>
			</Head>
			<Navbar />
			<main className="pt-20 bg-gray-1200 min-h-screen mr-[15%] ml-[15%]">
				<header className="mb-6">
					<h1 className="text-2xl font-semibold pt-6">
						Welcome to mySchneider {isLoaded && user.firstName}
					</h1>
				</header>
				<div className="flex h-full">
					<div className="flex flex-col flex-grow">
						{permitState?.check("view", "Products") && (
							<div className="bg-white p-1 h-[250px] bg-gradient-to-r from-blue-500 to-green-500 rounded-lg mt-2 mb-2">
								<div className="h-full w-full bg-white p-4 rounded-md flex justify-center items-center  text-xl font-bold">
									Products
								</div>
							</div>
						)}
						{permitState?.check("view", "Product_Configurators") && (
							<div className="bg-white p-1 h-[200px] bg-gradient-to-r from-red-500 to-orange-500 rounded-lg mt-2 mb-2">
								<div className="h-full w-full bg-white p-4 rounded-md flex justify-center items-center text-xl font-bold">
									Product Configurators
								</div>
							</div>
						)}
						{permitState?.check("view", "Project_Builder") && (
							<div className="bg-white p-1 h-[200px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mt-2 mb-2">
								<div className="h-full w-full bg-white p-4 rounded-md flex justify-center items-center text-xl font-bold">
									Project Builder
								</div>
							</div>
						)}
						{permitState?.check("view", "Topics_for_you") && (
							<div className="bg-white p-1 h-[100px] bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg mt-2 mb-2">
								<div className="h-full w-full bg-white p-4 rounded-md flex justify-center items-center text-xl font-bold">
									Topics for you
								</div>
							</div>
						)}
						{permitState?.check("view", "Topics_for_you", {
							country: "PL",
							channel: "SI",
						}) && (
							<div className="bg-white p-1 h-[100px] bg-gradient-to-r from-yellow-500 to-lime-500 rounded-lg mt-2 mb-2">
								<div className="h-full w-full bg-white p-4 rounded-md flex justify-center items-center text-xl font-bold">
									Topics for SI channel based in Poland 🇵🇱
								</div>
							</div>
						)}
						{permitState?.check("view", "Topics_for_you", {
							country: "UK",
							channel: "BE",
						}) && (
							<div className="bg-white p-1 h-[200px] bg-gradient-to-r from-red-500 to-orange-500 rounded-lg mt-2 mb-2">
								<div className="h-full w-full bg-white p-4 rounded-md flex justify-center items-center text-xl font-bold">
									Topics for BE channel based in England 🇬🇧
								</div>
							</div>
						)}
					</div>

					<div className="w-1/4 bg-white rounded-lg mt-2 mb-2 ml-4 h-full p-4 flex flex-col">
						<h2 className="mb-4">Support Cases</h2>
						{mockSupportCases.map((caseInfo) => (
							<div
								key={caseInfo.id}
								className="bg-gray-100 mb-4 p-2 rounded shadow text-sm w-full"
							>
								<h3 className="mb-2">
									{caseInfo.status === "Open" && "🟢 "}
									{caseInfo.status === "Closed" && "🔴 "}
									{caseInfo.status === "In Progress" && "🟠 "}
									{caseInfo.title}
								</h3>
								<p>
									<strong>Status:</strong> {caseInfo.status}
								</p>
								<p>
									<strong>Created:</strong> {caseInfo.createdDate}
								</p>
								<p>
									<strong>Last Updated:</strong> {caseInfo.lastUpdated}
								</p>
							</div>
						))}
					</div>
				</div>
			</main>
		</div>
	);
};

export default HomePage;
