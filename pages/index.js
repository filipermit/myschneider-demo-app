import Head from "next/head";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";

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

const HomePage = () => (
	<div className="bg-gray-200">
		<Head>
			<title>mySchneider</title>
		</Head>
		<Navbar />
		<main className="pt-20 bg-gray-1200 min-h-screen mr-[15%] ml-[15%]">
			<header className="mb-6">
				<h1 className="text-2xl font-semibold pt-6">Welcome to mySchneider</h1>{" "}
			</header>
			<div className="flex h-full">
				<div className="flex flex-col flex-grow">
					<div className="bg-white m-4 p-4 h-[250px]">Products</div>
					<div className="bg-white m-4 p-4 h-[200px]">
						Product Configurations
					</div>
					<div className="bg-white m-4 p-4 h-[200px]">Project Builder</div>
					<div className="bg-white m-4 p-4 h-[100px]">Topics for you</div>
				</div>

				<div className="w-1/4 bg-white m-4 h-full p-4 flex flex-col">
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

export default HomePage;
