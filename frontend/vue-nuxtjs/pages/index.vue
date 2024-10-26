<template>
  <div class="min-h-screen flex flex-col bg-teal-50">
    <Header />
    <main class="flex-grow container mx-auto px-4 py-20 my-10">
      <!-- Adjusted spacing -->
      <div class="text-center mb-10">
        <h1 class="text-5xl font-extrabold text-teal-800 mb-6">
          EduKit | create-edu-dapp
        </h1>
        <p class="text-2xl text-teal-600 max-w-2xl mx-auto leading-relaxed">
          Explore our collection of educational dApps designed to help you build and ship fast on EduChain.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <NuxtLink
          v-for="(dapp, index) in dapps"
          :key="index"
          :to="dapp.route"
          class="transform transition-transform hover:scale-105 cursor-pointer"
        >
          <Card class="h-full border-2 border-teal-200 hover:border-teal-400 bg-white shadow-lg" @click.stop>
            <CardHeader>
              <CardTitle class="text-2xl font-bold text-teal-700">{{ dapp.title }}</CardTitle>
              <CardDescription class="text-teal-600">{{ dapp.description }}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul class="list-disc list-inside text-teal-800">
                <li v-for="(feature, i) in dapp.features" :key="i">
                  {{ feature }}
                </li>
              </ul>
            </CardContent>
          </Card>
        </NuxtLink>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
const dapps = [
  {
    title: "Simple Greeting",
    description: "Send and receive greetings on the blockchain",
    features: ["Simple greetings dapp", "Send and receive greetings onchain", "Display the last greeting"],
    route: "/simple-greeting-dapp"
  },
  {
    title: "Study Timer Tracker",
    description: "Track study time on the blockchain",
    features: ["Start and stop a study timer", "Record study session duration", "Display total study time"],
    route: "/study-time-dapp"
  },
  {
    title: "Student Anonymous Feedback",
    description: "Submit anonymous feedback about courses",
    features: ["Simple feedback form", "Store feedback on-chain anonymously", "Only educators with ocid usernames that start with 'edu_' can view aggregated feedback."],
    route: "/anonymous-feedback-dapp"
  },
  {
    title: "Assignment Submission",
    description: "Submit proof of assignment completion",
    features: ["Upload assignment details", "Store submission details on-chain", "Only educators ocid with usernames that start with 'edu_' can verify and view submissions."],
    route: "/assignment-submission-dapp"
  },
  {
    title: "Classroom Poll",
    description: "Conduct quick polls during class sessions",
    features: ["Create and display polls", "Record votes on-chain", "Real-time poll results"],
    route: "/class-poll-dapp"
  },
  {
    title: "Study Group Chat",
    description: "Students share messages in a group chat.",
    features: ["Join group chat and share messages", "Record messages on-chain", "Show the Messages"],
    route: "/student-group-dapp"
  }
]
</script>
